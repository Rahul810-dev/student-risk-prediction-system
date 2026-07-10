package com.tansam;

import java.sql.*;
import java.net.http.*;
import java.net.URI;
import java.nio.charset.StandardCharsets;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class App {

    public static void main(String[] args) {

        String url = "jdbc:postgresql://localhost:5432/myapp";
        String user = "postgres";
        String password = "978754";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {

            System.out.println("Connected Successfully!");

            String query = """
                SELECT a.student_id,
                       a.semester,x
                       a.gpa_current,
                       a.gpa_previous,
                       a.backlogs_count,
                       at.attendance_percent,
                       at.consecutive_absences
                FROM academic a
                JOIN attendance at
                  ON a.student_id = at.student_id
                """;

            PreparedStatement stmt = conn.prepareStatement(query);
            ResultSet rs = stmt.executeQuery();

            HttpClient client = HttpClient.newHttpClient();
            ObjectMapper mapper = new ObjectMapper();

            while (rs.next()) {

                String studentId = rs.getString("student_id");
                String semester = rs.getString("semester");

                double gpaCurrent = rs.getDouble("gpa_current");
                double gpaPrevious = rs.getDouble("gpa_previous");
                int backlogs = rs.getInt("backlogs_count");
                double attendance = rs.getDouble("attendance_percent");
                int absences = rs.getInt("consecutive_absences");

                // Build JSON payload for ML
                String jsonPayload = String.format("""
                    {
                      "gpa_current": %.2f,
                      "gpa_previous": %.2f,
                      "backlogs": %d,
                      "attendance": %.2f,
                      "absences": %d
                    }
                    """,
                        gpaCurrent,
                        gpaPrevious,
                        backlogs,
                        attendance,
                        absences
                );

                try {

                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create("http://localhost:8000/predict"))
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                            .build();

                    HttpResponse<String> response =
                            client.send(request, HttpResponse.BodyHandlers.ofString());

                    String responseBody = response.body();
                    System.out.println("ML Response: " + responseBody);

                    JsonNode jsonNode = mapper.readTree(responseBody);

                    double overallRisk =
                            jsonNode.get("overall_risk_probability").asDouble();
                    double cgpaRisk =
                            jsonNode.get("cgpa_risk_probability").asDouble();
                    double backlogRisk =
                            jsonNode.get("backlog_risk_probability").asDouble();
                    double assignmentRisk =
                            jsonNode.get("assignment_risk_probability").asDouble();
                    double attendanceRisk =
                            jsonNode.get("attendance_risk_probability").asDouble();
                    double modelAccuracy =
                            jsonNode.get("model_accuracy").asDouble();

                    // Store in risk_prediction table
                    String insertQuery = """
                        INSERT INTO risk_prediction
                        (student_id, semester,
                         overall_risk_probability,
                         cgpa_risk_probability,
                         backlog_risk_probability,
                         assignment_risk_probability,
                         attendance_risk_probability,
                         model_accuracy)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """;

                    PreparedStatement insertStmt =
                            conn.prepareStatement(insertQuery);

                    insertStmt.setString(1, studentId);
                    insertStmt.setString(2, semester);
                    insertStmt.setDouble(3, overallRisk);
                    insertStmt.setDouble(4, cgpaRisk);
                    insertStmt.setDouble(5, backlogRisk);
                    insertStmt.setDouble(6, assignmentRisk);
                    insertStmt.setDouble(7, attendanceRisk);
                    insertStmt.setDouble(8, modelAccuracy);

                    insertStmt.executeUpdate();

                    System.out.println("Stored ML prediction for: " + studentId);

                } catch (Exception e) {
                    System.out.println("ML server not reachable yet.");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}