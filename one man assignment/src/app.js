const { useEffect, useMemo, useRef, useState } = React;

const STORAGE_KEY = "student-hub-records-v1";
const ENROLLMENT_STATUSES = ["Active", "On leave", "Graduated"];

const SAMPLE_STUDENTS = [
  {
    id: "DIWA-2401",
    fullName: "Mpho Nthunya",
    age: 21,
    email: "mpho.nthunya@example.com",
    course: "Diploma in Information Technology",
    enrollmentStatus: "Active",
    isActive: true,
  },
  {
    id: "DIWA-2402",
    fullName: "Lerato Mokoena",
    age: 23,
    email: "lerato.mokoena@example.com",
    course: "Diploma in Business Information Technology",
    enrollmentStatus: "Active",
    isActive: true,
  },
  {
    id: "DIWA-2403",
    fullName: "Thabo Rasebelisoa",
    age: 20,
    email: "thabo.rasebelisoa@example.com",
    course: "Diploma in Information Technology",
    enrollmentStatus: "On leave",
    isActive: false,
  },
  {
    id: "DIWA-2404",
    fullName: "Palesa Mokhothu",
    age: 25,
    email: "palesa.mokhothu@example.com",
    course: "Diploma in Business Information Technology",
    enrollmentStatus: "Graduated",
    isActive: false,
  },
  {
    id: "DIWA-2405",
    fullName: "Kabelo Tšosane",
    age: 22,
    email: "kabelo.tsosane@example.com",
    course: "Diploma in Information Technology",
    enrollmentStatus: "Active",
    isActive: true,
  },
];

function loadStudents() {
  try {
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    if (savedRecords === null) {
      return { students: SAMPLE_STUDENTS, error: "" };
    }

    const parsedRecords = JSON.parse(savedRecords);
    if (
      !Array.isArray(parsedRecords) ||
      parsedRecords.some(
        (student) =>
          typeof student.id !== "string" ||
          typeof student.fullName !== "string" ||
          typeof student.age !== "number" ||
          typeof student.email !== "string" ||
          typeof student.course !== "string" ||
          typeof student.enrollmentStatus !== "string" ||
          typeof student.isActive !== "boolean",
      )
    ) {
      throw new Error("Saved student records have an invalid format.");
    }

    return { students: parsedRecords, error: "" };
  } catch (error) {
    console.error("Unable to load saved student records:", error);
    return {
      students: SAMPLE_STUDENTS,
      error: "Saved records could not be loaded. Sample records are shown instead.",
    };
  }
}

function validateStudent(values, students, editingId = null) {
  const errors = {};
  const fullName = values.fullName.trim();
  const email = values.email.trim();
  const course = values.course.trim();
  const age = Number(values.age);

  if (!fullName) {
    errors.fullName = "Enter the student's full name.";
  } else if (fullName.length < 2) {
    errors.fullName = "Name must contain at least 2 characters.";
  }

  if (!values.age) {
    errors.age = "Enter the student's age.";
  } else if (!Number.isInteger(age) || age < 16 || age > 100) {
    errors.age = "Age must be a whole number from 16 to 100.";
  }

  if (!email) {
    errors.email = "Enter an email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (
    students.some(
      (student) =>
        student.id !== editingId &&
        student.email.toLowerCase() === email.toLowerCase(),
    )
  ) {
    errors.email = "A student with this email address already exists.";
  }

  if (!course) {
    errors.course = "Enter the student's course of study.";
  }

  if (!ENROLLMENT_STATUSES.includes(values.enrollmentStatus)) {
    errors.enrollmentStatus = "Choose a valid enrollment status.";
  }

  return errors;
}

function createStudentRecord(values, id) {
  const enrollmentStatus = values.enrollmentStatus;
  return {
    id,
    fullName: values.fullName.trim(),
    age: Number(values.age),
    email: values.email.trim(),
    course: values.course.trim(),
    enrollmentStatus,
    isActive: enrollmentStatus === "Active",
  };
}

function makeStudentId(students) {
  const year = new Date().getFullYear();
  const nextNumber = students.reduce((largestNumber, student) => {
    const match = student.id.match(/^STU-\d{4}-(\d+)$/);
    return match ? Math.max(largestNumber, Number(match[1])) : largestNumber;
  }, 0) + 1;
  return `STU-${year}-${String(nextNumber).padStart(4, "0")}`;
}

function initialsFor(fullName) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function StudentForm({ student, students, onSave, onCancel }) {
  const [values, setValues] = useState({
    fullName: student ? student.fullName : "",
    age: student ? String(student.age) : "",
    email: student ? student.email : "",
    course: student ? student.course : "",
    enrollmentStatus: student ? student.enrollmentStatus : "Active",
  });
  const [errors, setErrors] = useState({});
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateStudent(values, students, student?.id);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalidField = Object.keys(validationErrors)[0];
      document.getElementById(`student-${firstInvalidField}`)?.focus();
      return;
    }

    onSave(values);
  }

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label className="field field-full" htmlFor="student-fullName">
          <span>Full name</span>
          <input
            ref={nameInputRef}
            id="student-fullName"
            name="fullName"
            type="text"
            placeholder="e.g. Mpho Nthunya"
            autoComplete="name"
            value={values.fullName}
            onChange={handleChange}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "error-fullName" : undefined}
          />
          {errors.fullName && (
            <span className="field-error" id="error-fullName" role="alert">
              {errors.fullName}
            </span>
          )}
        </label>

        <label className="field" htmlFor="student-age">
          <span>Age</span>
          <input
            id="student-age"
            name="age"
            type="number"
            min="16"
            max="100"
            step="1"
            placeholder="e.g. 21"
            value={values.age}
            onChange={handleChange}
            aria-invalid={Boolean(errors.age)}
            aria-describedby={errors.age ? "error-age" : undefined}
          />
          {errors.age && (
            <span className="field-error" id="error-age" role="alert">
              {errors.age}
            </span>
          )}
        </label>

        <label className="field" htmlFor="student-enrollmentStatus">
          <span>Enrollment status</span>
          <select
            id="student-enrollmentStatus"
            name="enrollmentStatus"
            value={values.enrollmentStatus}
            onChange={handleChange}
            aria-invalid={Boolean(errors.enrollmentStatus)}
            aria-describedby={
              errors.enrollmentStatus ? "error-enrollmentStatus" : undefined
            }
          >
            {ENROLLMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.enrollmentStatus && (
            <span
              className="field-error"
              id="error-enrollmentStatus"
              role="alert"
            >
              {errors.enrollmentStatus}
            </span>
          )}
        </label>

        <label className="field field-full" htmlFor="student-email">
          <span>Email address</span>
          <input
            id="student-email"
            name="email"
            type="email"
            placeholder="student@example.com"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "error-email" : undefined}
          />
          {errors.email && (
            <span className="field-error" id="error-email" role="alert">
              {errors.email}
            </span>
          )}
        </label>

        <label className="field field-full" htmlFor="student-course">
          <span>Course of study</span>
          <input
            id="student-course"
            name="course"
            type="text"
            placeholder="e.g. Diploma in Information Technology"
            value={values.course}
            onChange={handleChange}
            aria-invalid={Boolean(errors.course)}
            aria-describedby={errors.course ? "error-course" : undefined}
          />
          {errors.course && (
            <span className="field-error" id="error-course" role="alert">
              {errors.course}
            </span>
          )}
        </label>
      </div>

      <div className="modal-actions">
        <button className="button button-quiet" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button button-primary" type="submit">
          {student ? "Save changes" : "Add student"}
        </button>
      </div>
    </form>
  );
}

function StudentModal({ student, students, onSave, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-modal-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{student ? "UPDATE RECORD" : "NEW RECORD"}</p>
            <h2 id="student-modal-title">
              {student ? "Edit student" : "Add a student"}
            </h2>
            <p className="modal-description">
              {student
                ? "Update the details below. Changes appear straight away."
                : "Add a student to your directory. All fields are required."}
            </p>
          </div>
          <button
              className="icon-button modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>
        <StudentForm
          student={student}
          students={students}
          onSave={onSave}
          onCancel={onClose}
        />
      </section>
    </div>
  );
}

function DeleteModal({ student, onConfirm, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal-card delete-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <div className="delete-icon">
          <TrashIcon />
        </div>
        <p className="eyebrow">DELETE RECORD</p>
        <h2 id="delete-modal-title">Remove this student?</h2>
        <p className="modal-description" id="delete-modal-description">
          <strong>{student.fullName}</strong> will be permanently removed from
          this directory. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>
            Keep student
          </button>
          <button
            className="button button-danger"
            type="button"
            onClick={onConfirm}
          >
            Delete student
          </button>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");
  return (
    <span className={`status-badge status-${statusClass}`}>
      <span className="status-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

function StudentRow({ student, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <span className="student-id">{student.id}</span>
      </td>
      <td>
        <div className="student-identity">
          <span className="avatar" aria-hidden="true">
            {initialsFor(student.fullName)}
          </span>
          <span className="student-name">{student.fullName}</span>
        </div>
      </td>
      <td className="age-cell">{student.age}</td>
      <td>
        <a className="email-link" href={`mailto:${student.email}`}>
          {student.email}
        </a>
      </td>
      <td className="course-cell">{student.course}</td>
      <td>
        <StatusBadge status={student.enrollmentStatus} />
      </td>
      <td>
        <div className="row-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => onEdit(student)}
            aria-label={`Edit ${student.fullName}`}
            title="Edit student"
          >
            <EditIcon />
          </button>
          <button
            className="icon-button icon-button-delete"
            type="button"
            onClick={() => onDelete(student)}
            aria-label={`Delete ${student.fullName}`}
            title="Delete student"
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

function EmptyState({ hasFilters, onAddStudent, onClearFilters }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <PeopleIcon />
      </div>
      <h3>{hasFilters ? "No matching students" : "Your directory is empty"}</h3>
      <p>
        {hasFilters
          ? "Try a different search or status filter."
          : "Add your first student to get the directory started."}
      </p>
      {hasFilters ? (
        <button className="button button-quiet" onClick={onClearFilters}>
          Clear filters
        </button>
      ) : (
        <button className="button button-primary" onClick={onAddStudent}>
          <PlusIcon />
          Add a student
        </button>
      )}
    </div>
  );
}

function App() {
  const [initialData] = useState(loadStudents);
  const [students, setStudents] = useState(initialData.students);
  const [storageError, setStorageError] = useState(initialData.error);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [sortOrder, setSortOrder] = useState("ascending");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      setStorageError("");
    } catch (error) {
      console.error("Unable to save student records:", error);
      setStorageError(
        "Changes are visible now, but could not be saved in this browser.",
      );
    }
  }, [students]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const visibleStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return students
      .filter((student) => {
        const matchesSearch =
          !normalizedSearch ||
          [
            student.id,
            student.fullName,
            student.email,
            student.course,
          ].some((value) => value.toLowerCase().includes(normalizedSearch));
        const matchesStatus =
          statusFilter === "All statuses" ||
          student.enrollmentStatus === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((firstStudent, secondStudent) => {
        const comparison = firstStudent.fullName.localeCompare(
          secondStudent.fullName,
        );
        return sortOrder === "ascending" ? comparison : -comparison;
      });
  }, [students, searchTerm, statusFilter, sortOrder]);

  const activeCount = students.filter((student) => student.isActive).length;
  const graduatedCount = students.filter(
    (student) => student.enrollmentStatus === "Graduated",
  ).length;
  const hasFilters = Boolean(searchTerm.trim()) || statusFilter !== "All statuses";

  function handleSave(values) {
    if (modal?.type === "edit") {
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === modal.student.id
            ? createStudentRecord(values, student.id)
            : student,
        ),
      );
      setToast("Student details updated.");
    } else {
      const newStudent = createStudentRecord(values, makeStudentId(students));
      setStudents((currentStudents) => [newStudent, ...currentStudents]);
      setToast("Student added to the directory.");
    }
    setModal(null);
  }

  function handleDelete() {
    if (modal?.type !== "delete") return;
    setStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== modal.student.id),
    );
    setToast(`${modal.student.fullName} was removed.`);
    setModal(null);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All statuses");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Student Hub home">
          <span className="brand-mark">
            <BookIcon />
          </span>
          <span className="brand-copy">
            <strong>student<span>hub</span></strong>
            <small>MANAGEMENT PORTAL</small>
          </span>
        </a>
        <div className="sidebar-rule" />
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          <a className="nav-item nav-item-active" href="#directory">
            <PeopleIcon />
            <span>Student directory</span>
            <span className="nav-count">{students.length}</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="semester-card">
            <span className="semester-dot" />
            <div>
              <strong>Semester 3</strong>
              <span>Academic year 2026</span>
            </div>
          </div>
          <div className="profile-card">
            <span className="profile-avatar">LB</span>
            <span className="profile-details">
              <strong>Course lecturer</strong>
              <span>Faculty of ICT</span>
            </span>
            <span className="profile-menu" aria-hidden="true">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="directory">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Student directory</strong>
          </div>
          <div className="topbar-right">
            <span className="date-label">
              {new Intl.DateTimeFormat("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </span>
            <span className="topbar-avatar" aria-label="Course lecturer">
              LB
            </span>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">FACULTY OF ICT <span>•</span> MASERU, LESOTHO</p>
              <h1>Student directory</h1>
              <p className="page-subtitle">
                A clear view of your students, all in one place.
              </p>
            </div>
            <button
              className="button button-primary add-button"
              onClick={() => setModal({ type: "add" })}
            >
              <PlusIcon />
              Add student
            </button>
          </section>

          {storageError && (
            <div className="storage-notice" role="status">
              <span>{storageError}</span>
              <button
                className="notice-dismiss"
                type="button"
                onClick={() => setStorageError("")}
                aria-label="Dismiss storage notice"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          <section className="stats-grid" aria-label="Student statistics">
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-label">Total students</span>
                <span className="stat-icon stat-icon-blue"><PeopleIcon /></span>
              </div>
              <div className="stat-value">{students.length}</div>
              <div className="stat-footnote">In your student directory</div>
            </article>
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-label">Currently active</span>
                <span className="stat-icon stat-icon-green"><CheckIcon /></span>
              </div>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-footnote">
                {students.length
                  ? `${Math.round((activeCount / students.length) * 100)}% of all students`
                  : "No active students yet"}
              </div>
            </article>
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-label">Graduated</span>
                <span className="stat-icon stat-icon-violet"><CapIcon /></span>
              </div>
              <div className="stat-value">{graduatedCount}</div>
              <div className="stat-footnote">Completed their studies</div>
            </article>
          </section>

          <section className="directory-card" aria-labelledby="directory-heading">
            <div className="directory-heading">
              <div>
                <h2 id="directory-heading">All students</h2>
                <p>
                  {visibleStudents.length}{" "}
                  {visibleStudents.length === 1 ? "record" : "records"}
                  {hasFilters ? " found" : " in your directory"}
                </p>
              </div>
              <span className="records-pill">{students.length} TOTAL</span>
            </div>

            <div className="toolbar">
              <label className="search-box">
                <SearchIcon />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, ID, email or course..."
                  aria-label="Search student records"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <CloseIcon />
                  </button>
                )}
              </label>
              <div className="toolbar-controls">
                <label className="select-wrap">
                  <FilterIcon />
                  <select
                    aria-label="Filter by enrollment status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option>All statuses</option>
                    {ENROLLMENT_STATUSES.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                  <ChevronIcon />
                </label>
                <button
                  className="button button-sort"
                  type="button"
                  onClick={() =>
                    setSortOrder((currentOrder) =>
                      currentOrder === "ascending" ? "descending" : "ascending",
                    )
                  }
                  aria-label={`Sort by name ${
                    sortOrder === "ascending" ? "descending" : "ascending"
                  }`}
                  title={`Sort name ${
                    sortOrder === "ascending" ? "descending" : "ascending"
                  }`}
                >
                  <SortIcon />
                  <span>{sortOrder === "ascending" ? "A–Z" : "Z–A"}</span>
                </button>
              </div>
            </div>

            {visibleStudents.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">STUDENT ID</th>
                      <th scope="col">STUDENT</th>
                      <th scope="col">AGE</th>
                      <th scope="col">EMAIL ADDRESS</th>
                      <th scope="col">COURSE OF STUDY</th>
                      <th scope="col">STATUS</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleStudents.map((student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        onEdit={(record) => setModal({ type: "edit", student: record })}
                        onDelete={(record) =>
                          setModal({ type: "delete", student: record })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                hasFilters={hasFilters}
                onAddStudent={() => setModal({ type: "add" })}
                onClearFilters={clearFilters}
              />
            )}

            <footer className="table-footer">
              <span>
                Showing <strong>{visibleStudents.length}</strong> of{" "}
                <strong>{students.length}</strong> students
              </span>
              <span className="saved-indicator">
                <span className="saved-dot" /> Saved in this browser
              </span>
            </footer>
          </section>

          <footer className="page-footer">
            <span>Student Hub <span className="footer-separator">·</span> DIWA2110</span>
            <span>Student records are stored locally on this device.</span>
          </footer>
        </div>
      </main>

      {modal?.type === "add" && (
        <StudentModal
          student={null}
          students={students}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "edit" && (
        <StudentModal
          student={modal.student}
          students={students}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteModal
          student={modal.student}
          onConfirm={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check"><CheckIcon /></span>
          {toast}
        </div>
      )}
    </div>
  );
}

function Icon({ children, size = 18, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function PeopleIcon() {
  return <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;
}

function BookIcon() {
  return <Icon size={21}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><path d="M8 7h8M8 11h6" /></Icon>;
}

function PlusIcon() {
  return <Icon size={17}><path d="M12 5v14M5 12h14" /></Icon>;
}

function CloseIcon() {
  return <Icon size={17}><path d="m18 6-12 12M6 6l12 12" /></Icon>;
}

function EditIcon() {
  return <Icon size={16}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></Icon>;
}

function TrashIcon() {
  return <Icon size={16}><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5m4-5v5" /></Icon>;
}

function SearchIcon() {
  return <Icon size={17}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>;
}

function FilterIcon() {
  return <Icon size={16}><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1" /><circle cx="15" cy="12" r="1" /></Icon>;
}

function ChevronIcon() {
  return <Icon size={15}><path d="m7 10 5 5 5-5" /></Icon>;
}

function SortIcon() {
  return <Icon size={16}><path d="M8 6h13M8 12h9M8 18h5M3 6v12m0 0 3-3m-3 3-3-3" /></Icon>;
}

function CheckIcon() {
  return <Icon size={16}><path d="m5 12 4 4L19 6" /></Icon>;
}

function CapIcon() {
  return <Icon size={18}><path d="m2 10 10-5 10 5-10 5-10-5Z" /><path d="M6 12v5c3.33 2.67 8.67 2.67 12 0v-5m4-2v6" /></Icon>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
