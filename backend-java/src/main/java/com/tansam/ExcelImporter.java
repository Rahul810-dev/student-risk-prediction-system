package com.tansam;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileInputStream;

public class ExcelImporter {

    public static void main(String[] args) {

        try {

            FileInputStream file = new FileInputStream("data/students_update.xlsx");

            Workbook workbook = new XSSFWorkbook(file);
            Sheet sheet = workbook.getSheetAt(0);

            String url = "jdbc:postgresql://localhost:5432/myapp";
            String user = "postgres";
            String password = "978754";

            Connection conn = DriverManager.getConnection(url, user, password);

            String sql = "INSERT INTO students (" +
                    "student_id, student_name, department, section, year, semester," +
                    "cgpa_current, gpa_previous, backlogs, attendance_percent," +
                    "consecutive_absences, phone_number, email, parent_contact, address)" +
                    " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)" +
                    " ON CONFLICT (student_id) DO UPDATE SET " +
                    "cgpa_current = EXCLUDED.cgpa_current, " +
                    "attendance_percent = EXCLUDED.attendance_percent, " +
                    "consecutive_absences = EXCLUDED.consecutive_absences";

            PreparedStatement pstmt = conn.prepareStatement(sql);

            for (Row row : sheet) {

                if (row.getRowNum() == 0) continue;

                String studentName = getCellValue(row.getCell(0));
                String department = getCellValue(row.getCell(1));
                String section = getCellValue(row.getCell(2));
                String year = getCellValue(row.getCell(3));
                String studentId = getCellValue(row.getCell(4));

                int semester = (int) Double.parseDouble(getCellValue(row.getCell(5)));

                double cgpaCurrent = Double.parseDouble(getCellValue(row.getCell(6)));
                double gpaPrevious = Double.parseDouble(getCellValue(row.getCell(7)));
                int backlogs = (int) Double.parseDouble(getCellValue(row.getCell(8)));

                double attendancePercent = Double.parseDouble(getCellValue(row.getCell(9)));
                int absences = (int) Double.parseDouble(getCellValue(row.getCell(10)));

                String phoneNumber = getCellValue(row.getCell(11));
                String email = getCellValue(row.getCell(12));
                String parentContact = getCellValue(row.getCell(13));
                String address = getCellValue(row.getCell(14));

                System.out.println(studentName + " | " + cgpaCurrent + " | " + attendancePercent);

                pstmt.setString(1, studentId);
                pstmt.setString(2, studentName);
                pstmt.setString(3, department);
                pstmt.setString(4, section);
                pstmt.setString(5, year);
                pstmt.setInt(6, semester);

                pstmt.setDouble(7, cgpaCurrent);
                pstmt.setDouble(8, gpaPrevious);
                pstmt.setInt(9, backlogs);

                pstmt.setDouble(10, attendancePercent);
                pstmt.setInt(11, absences);

                pstmt.setString(12, phoneNumber);
                pstmt.setString(13, email);
                pstmt.setString(14, parentContact);
                pstmt.setString(15, address);

                pstmt.executeUpdate();
            }

            workbook.close();
            conn.close();

            System.out.println("Excel data successfully imported into PostgreSQL.");

            // trigger predict_all.py automatically after Excel import
            System.out.println("Triggering ML predictions...");

            ProcessBuilder pb = new ProcessBuilder(
                    "python",
                    "D:/Tansam_Intern/ml-service/predict_all.py"
            );

            pb.directory(new java.io.File("D:/Tansam_Intern/ml-service"));
            pb.inheritIO();

            Process process = pb.start();
            process.waitFor();

            System.out.println("All predictions completed.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String getCellValue(Cell cell) {

        if (cell == null) return "";

        switch (cell.getCellType()) {

            case STRING:
                return cell.getStringCellValue();

            case NUMERIC:
                return String.valueOf(cell.getNumericCellValue());

            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());

            default:
                return "";
        }
    }
}