import { useState, useEffect } from "react";

const API = "http://localhost:8000";

export default function MentorAllocation() {
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [uploadYear, setUploadYear] = useState("");
  const [uploadSection, setUploadSection] = useState("");
  const [uploadTeacherId, setUploadTeacherId] = useState("");
  const [file, setFile] = useState(null);
  const [reassignOld, setReassignOld] = useState("");
  const [reassignNew, setReassignNew] = useState("");

  const loadTeachers = () => {
    fetch(`${API}/admin/mentor-allocation/teachers?department=${department}`)
      .then((r) => r.json())
      .then(setTeachers)
      .catch(() => setTeachers([]));
  };

  const handleReactivate = async (teacherId) => {
    const res = await fetch(`${API}/admin/teacher/${teacherId}/reactivate`, { method: "POST" });
    const data = await res.json();
    setMsg(data.error ? data.error : data.message);
    loadTeachers();
    };

  const handleReassign = async () => {
    if (!reassignOld || !reassignNew) {
        setMsg("Pick both the outgoing and incoming teacher.");
        return;
    }
    if (reassignOld === reassignNew) {
        setMsg("Outgoing and incoming teacher can't be the same.");
        return;
    }
    const res = await fetch(`${API}/admin/teacher/reassign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        old_teacher_id: Number(reassignOld),
        new_teacher_id: Number(reassignNew),
        }),
    });
    const data = await res.json();
    if (data.error) {
        setMsg(data.error);
    } else {
        setMsg(
        `Moved ${data.students_moved} students and rerouted ${data.leaves_rerouted} pending leaves from ${data.old_teacher} to ${data.new_teacher}. ${data.old_teacher}'s login has been deactivated.`
        );
    }
    setReassignOld("");
    setReassignNew("");
    loadStudents();
    loadTeachers();
    };

  const loadStudents = () => {
    setLoading(true);
    const params = new URLSearchParams({ department });
    if (year) params.append("year", year);
    if (section) params.append("section", section);
    fetch(`${API}/admin/mentor-allocation/students?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setStudents(data);
        setSelected(new Set());
        setLoading(false);
      })
      .catch(() => {
        setStudents([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTeachers();
  }, [department]);

  useEffect(() => {
    loadStudents();
  }, [department, year, section]);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === students.length) setSelected(new Set());
    else setSelected(new Set(students.map((s) => s.student_id)));
  };

  const handleAssign = async () => {
    if (!assignTeacherId || selected.size === 0) {
      setMsg("Select students and a teacher first.");
      return;
    }
    const res = await fetch(`${API}/admin/mentor-allocation/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_ids: Array.from(selected),
        teacher_id: Number(assignTeacherId),
      }),
    });
    const data = await res.json();
    setMsg(data.error ? data.error : `Assigned ${data.updated_count} students.`);
    loadStudents();
    loadTeachers();
  };

  const handleRemove = async (studentId) => {
    const res = await fetch(`${API}/admin/mentor-allocation/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_ids: [studentId] }),
    });
    const data = await res.json();
    setMsg(data.error ? data.error : "Removed from mentor.");
    loadStudents();
    loadTeachers();
  };

  const handleUpload = async () => {
    if (!file || !uploadTeacherId) {
      setMsg("Pick a file and a teacher to assign to.");
      return;
    }
    const formData = new FormData();
    formData.append("department", department);
    formData.append("year", uploadYear);
    formData.append("section", uploadSection);
    formData.append("teacher_id", uploadTeacherId);
    formData.append("file", file);

    const res = await fetch(`${API}/admin/mentor-allocation/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.error) {
      setMsg(data.error);
    } else {
      setMsg(
        `Assigned ${data.updated_count} students.` +
          (data.missing_count ? ` ${data.missing_count} roll numbers not found.` : "")
      );
    }
    loadStudents();
    loadTeachers();
  };

  return (
    <div className="mentor-allocation-page">
      <div className="page-header">
        <h2>Mentor Allocation</h2>
      </div>

      {msg && <div className="allocation-msg">{msg}</div>}

      <div className="filters-bar" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
        <option value="CSE">CSE</option>
        <option value="IT">IT</option>
        <option value="ME">ME</option>
        <option value="ECE">ECE</option>
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">All Years</option>
          <option value="1.0">Year 1</option>
          <option value="2.0">Year 2</option>
          <option value="3.0">Year 3</option>
          <option value="4.0">Year 4</option>
        </select>
        <input
          placeholder="Section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        />
      </div>

      <div className="bulk-assign-bar" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <select value={assignTeacherId} onChange={(e) => setAssignTeacherId(e.target.value)}>
          <option value="">Assign selected to...</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id} disabled={!t.is_active}>
                {t.teacher_name} ({t.student_count} students){!t.is_active ? " — INACTIVE" : ""}
            </option>
            ))}
        </select>
        <button onClick={handleAssign}>Assign Selected ({selected.size})</button>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <table className="allocation-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={students.length > 0 && selected.size === students.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Roll No</th>
              <th>Name</th>
              <th>Year</th>
              <th>Section</th>
              <th>Current Mentor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.student_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(s.student_id)}
                    onChange={() => toggleSelect(s.student_id)}
                  />
                </td>
                <td>{s.student_id}</td>
                <td>{s.student_name}</td>
                <td>{s.year}</td>
                <td>{s.section}</td>
                <td>{s.teacher_name || "Unassigned"}</td>
                <td>
                  {s.teacher_id && (
                    <button onClick={() => handleRemove(s.student_id)}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="upload-card" style={{ marginTop: "24px" }}>
        <h3>Bulk Upload Assignment</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <select value={uploadYear} onChange={(e) => setUploadYear(e.target.value)}>
            <option value="">Year</option>
            <option value="1.0">Year 1</option>
            <option value="2.0">Year 2</option>
            <option value="3.0">Year 3</option>
            <option value="4.0">Year 4</option>
          </select>
          <input
            placeholder="Section"
            value={uploadSection}
            onChange={(e) => setUploadSection(e.target.value)}
          />
          <select value={uploadTeacherId} onChange={(e) => setUploadTeacherId(e.target.value)}>
            <option value="">Assign to teacher...</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.teacher_name}
              </option>
            ))}
          </select>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload}>Upload & Assign</button>
        </div>
      </div>

      <div className="reassign-card" style={{ marginTop: "24px", padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
        <h3>Reassign Teacher (Teacher Leaving / Replaced)</h3>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
            Moves ALL students from the outgoing teacher to the incoming teacher, and reroutes their pending leave requests too.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <select value={reassignOld} onChange={(e) => setReassignOld(e.target.value)}>
            <option value="">Outgoing teacher...</option>
            {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                {t.teacher_name} ({t.student_count} students)
                </option>
            ))}
            </select>
            <select value={reassignNew} onChange={(e) => setReassignNew(e.target.value)}>
            <option value="">Incoming teacher...</option>
            {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                {t.teacher_name} ({t.student_count} students)
                </option>
            ))}
            </select>
            <button onClick={handleReassign}>Reassign All Students</button>
        </div>
        </div>

        <div className="teacher-status-card" style={{ marginTop: "24px", padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
        <h3>Teacher Status</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
            <tr>
                <th style={{ textAlign: "left" }}>Teacher</th>
                <th style={{ textAlign: "left" }}>Students</th>
                <th style={{ textAlign: "left" }}>Status</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {teachers.map((t) => (
                <tr key={t.id}>
                <td>{t.teacher_name}</td>
                <td>{t.student_count}</td>
                <td>{t.is_active ? "Active" : "Inactive"}</td>
                <td>
                    {!t.is_active && (
                    <button onClick={() => handleReactivate(t.id)}>Reactivate</button>
                    )}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  );
}