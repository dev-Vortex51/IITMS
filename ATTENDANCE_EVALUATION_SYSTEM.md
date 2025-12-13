# Attendance Evaluation System - Complete Documentation

## Overview

The SIWES/IT Management System now includes a comprehensive rule-based attendance evaluation module that tracks student check-in/check-out, calculates punctuality, manages absence requests, and provides supervisor approval workflows.

## System Constants

The following constants define SIWES work standards (stored in `Attendance` model as static properties):

- **Work Start Time**: 8:00 AM
- **Work End Time**: 4:00 PM (16:00)
- **Grace Period**: 15 minutes
- **Minimum Required Hours**: 6 hours per day
- **Punctuality Cutoff**: 8:15 AM (8:00 AM + 15-minute grace period)

## Data Model

### Attendance Schema

```javascript
{
  student: ObjectId,                    // Reference to Student
  placement: ObjectId,                  // Reference to Placement
  date: Date,                           // Attendance date (midnight)
  checkInTime: Date,                    // Check-in timestamp
  checkOutTime: Date,                   // Check-out timestamp (optional)
  hoursWorked: Number,                  // Calculated hours (2 decimal places)
  location: {                           // GPS coordinates
    latitude: Number,
    longitude: Number
  },
  notes: String,                        // Student notes

  // Punctuality (auto-calculated, immutable)
  punctuality: {
    type: String,
    enum: ["ON_TIME", "LATE"],
    immutable: true                     // Cannot be changed after creation
  },

  // Day Status (final attendance status)
  dayStatus: {
    type: String,
    enum: [
      "PRESENT_ON_TIME",                // Checked in ≤8:15 AM, checked out, ≥6 hours
      "PRESENT_LATE",                   // Checked in >8:15 AM, checked out, ≥6 hours
      "HALF_DAY",                       // <6 hours worked
      "ABSENT",                         // No check-in
      "EXCUSED_ABSENCE",                // Approved absence request
      "INCOMPLETE"                      // Checked in but no checkout
    ],
    default: "INCOMPLETE"
  },

  // Approval Status
  approvalStatus: {
    type: String,
    enum: [
      "PENDING",                        // Awaiting supervisor review
      "APPROVED",                       // Approved by supervisor
      "REJECTED",                       // Rejected by supervisor
      "NEEDS_REVIEW"                    // Flagged for review
    ],
    default: "PENDING"
  },

  // Absence Management
  absenceReason: String,                // Reason for absence request
  reviewedBy: ObjectId,                 // Supervisor who reviewed
  reviewedAt: Date,                     // Review timestamp
  supervisorComment: String,            // Supervisor notes

  // Flags for reporting
  isLateEntry: Boolean,                 // True if checked in >8:15 AM
  isIncomplete: Boolean,                // True if no checkout by end of day

  // Backward compatibility
  status: {
    type: String,
    enum: ["present", "late", "absent"],
    default: "present"
  },
  acknowledgedBy: ObjectId,
  acknowledgedAt: Date
}
```

## Rule-Based Logic

### 1. Punctuality Detection

**Automatic calculation on check-in (immutable after creation):**

```javascript
if (checkInTime <= 8:15 AM) {
  punctuality = "ON_TIME"
  isLateEntry = false
} else {
  punctuality = "LATE"
  isLateEntry = true
}
```

**Important**: Punctuality is auto-detected and cannot be modified. Supervisors cannot override this field.

### 2. Hours Worked Calculation

**Automatic calculation on check-out:**

```javascript
hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
// Rounded to 2 decimal places
```

### 3. Day Status Resolution

**Final status determined by multiple factors:**

```javascript
if (!checkInTime) {
  if (absenceReason && approvalStatus === "APPROVED") {
    dayStatus = "EXCUSED_ABSENCE";
  } else {
    dayStatus = "ABSENT";
  }
} else if (!checkOutTime) {
  dayStatus = "INCOMPLETE";
} else if (hoursWorked < MIN_REQUIRED_HOURS) {
  dayStatus = "HALF_DAY";
} else {
  if (punctuality === "ON_TIME") {
    dayStatus = "PRESENT_ON_TIME";
  } else {
    dayStatus = "PRESENT_LATE";
  }
}
```

**Supervisor Override**: Supervisors can reclassify `dayStatus` manually if circumstances warrant (e.g., student left early for emergency but should be marked as HALF_DAY instead of INCOMPLETE).

## API Endpoints

### Student Endpoints

#### 1. Check In

**POST** `/api/v1/attendance/check-in`

```json
{
  "location": {
    "latitude": 6.5244,
    "longitude": 3.3792
  },
  "notes": "Arrived at office"
}
```

**Response:**

- Status 201: Check-in successful
- Auto-calculates `punctuality` (ON_TIME or LATE)
- Sets `isLateEntry` flag
- Creates record with `dayStatus: INCOMPLETE`

**Business Rules:**

- Student must have approved placement
- Can only check in once per day
- Cannot check in for past dates

---

#### 2. Check Out

**PUT** `/api/v1/attendance/check-out`

```json
{
  "location": {
    "latitude": 6.5244,
    "longitude": 3.3792
  },
  "notes": "Completed daily tasks"
}
```

**Response:**

- Status 200: Check-out successful
- Auto-calculates `hoursWorked`
- Updates `dayStatus` based on hours worked and punctuality
- Removes `isIncomplete` flag

**Business Rules:**

- Must have checked in today
- Can only check out once per day
- Check-out time must be after check-in time

---

#### 3. Submit Absence Request

**POST** `/api/v1/attendance/absence-request`

```json
{
  "date": "2024-01-15T00:00:00.000Z",
  "reason": "Medical appointment with doctor's note"
}
```

**Response:**

- Status 201: Absence request submitted
- Creates record with `dayStatus: ABSENT`, `approvalStatus: PENDING`

**Business Rules:**

- Cannot request absence for dates with existing check-in
- Cannot request absence for already-approved attendance
- Reason must be provided (10-500 characters recommended)

---

#### 4. Get Today's Status

**GET** `/api/v1/attendance/today`

Returns current day's attendance record if exists.

---

#### 5. Get Attendance History

**GET** `/api/v1/attendance/my-attendance?startDate=2024-01-01&endDate=2024-01-31&status=late`

**Query Parameters:**

- `startDate`: Filter from date (ISO format)
- `endDate`: Filter to date (ISO format)
- `status`: Filter by old status field (present/late/absent)

---

#### 6. Get Attendance Statistics

**GET** `/api/v1/attendance/my-stats`

Returns:

```json
{
  "total": 20,
  "present": 15,
  "late": 3,
  "absent": 2,
  "attendanceRate": 90,
  "currentStreak": 5
}
```

---

#### 7. Get Attendance Summary

**GET** `/api/v1/attendance/summary/:studentId`

Returns comprehensive summary with:

- Counts by day status (presentOnTime, presentLate, halfDay, absent, excusedAbsence, incomplete)
- Counts by approval status (pending, approved, rejected, needsReview)
- Completion percentage
- Punctuality rate
- Anomaly detection (frequent lateness, high absences, consecutive absences)

---

### Supervisor Endpoints

#### 8. Approve Attendance/Absence

**POST** `/api/v1/attendance/:attendanceId/approve`

```json
{
  "comment": "Attendance verified and approved"
}
```

**Response:**

- Updates `approvalStatus` to "APPROVED"
- If absence request: changes `dayStatus` to "EXCUSED_ABSENCE"
- Records supervisor and timestamp

**Business Rules:**

- Supervisor must be assigned to student's placement
- Can approve both attendance and absence requests

---

#### 9. Reject Attendance/Absence

**POST** `/api/v1/attendance/:attendanceId/reject`

```json
{
  "comment": "Invalid reason provided"
}
```

**Response:**

- Updates `approvalStatus` to "REJECTED"
- Records supervisor comment and timestamp

**Business Rules:**

- Supervisor must be assigned to student's placement
- Comment/reason is required

---

#### 10. Reclassify Day Status

**PATCH** `/api/v1/attendance/:attendanceId/reclassify`

```json
{
  "dayStatus": "HALF_DAY",
  "comment": "Student left early due to emergency, verified with company"
}
```

**Response:**

- Updates `dayStatus` to new value
- Sets `approvalStatus` to "NEEDS_REVIEW"
- Records supervisor action

**Valid Day Status Values:**

- `PRESENT_ON_TIME`
- `PRESENT_LATE`
- `HALF_DAY`
- `ABSENT`
- `EXCUSED_ABSENCE`
- `INCOMPLETE`

**Use Cases:**

- Convert INCOMPLETE to HALF_DAY (student left early)
- Convert INCOMPLETE to APPROVED (system issue, manual verification)
- Convert ABSENT to EXCUSED_ABSENCE (retroactive approval)

**Business Rules:**

- Supervisor must be assigned to student's placement
- Cannot reclassify `punctuality` (immutable)
- Comment is required to explain reclassification

---

#### 11. Get Placement Attendance

**GET** `/api/v1/attendance/placement/:placementId?startDate=2024-01-01&endDate=2024-01-31`

Returns all attendance records for students in a placement.

---

### Coordinator/Admin Endpoints

#### 12. Mark Students Absent

**POST** `/api/v1/attendance/mark-absent`

```json
{
  "date": "2024-01-14T00:00:00.000Z"
}
```

**Response:**

- Creates ABSENT records for all students with approved placements who didn't check in
- Returns array of created records

**Business Rules:**

- Defaults to yesterday if no date provided
- Only creates records for students without existing attendance for that date
- Can be run manually or scheduled as cron job

---

#### 13. Get Student Attendance (Any Student)

**GET** `/api/v1/attendance/student/:studentId?startDate=2024-01-01&endDate=2024-01-31`

Coordinators can view students in their department only.

---

## Workflows

### Daily Workflow

**Morning:**

1. Student checks in (before 8:15 AM for ON_TIME status)
2. System auto-calculates punctuality (immutable)
3. Record created with `dayStatus: INCOMPLETE`

**During Day:** 4. Student can view current status via `/attendance/today` 5. Supervisor can monitor attendance in real-time

**End of Day:** 6. Student checks out (ideally by 4:00 PM) 7. System calculates hours worked 8. System updates `dayStatus`:

- If ≥6 hours: `PRESENT_ON_TIME` or `PRESENT_LATE` (based on check-in)
- If <6 hours: `HALF_DAY`

**Night (Automated):** 9. Cron job or coordinator runs `/mark-absent` for previous day 10. Students without check-in get `ABSENT` records

---

### Absence Request Workflow

**Student:**

1. Submit absence request with reason (before or after date)
2. Record created with `dayStatus: ABSENT`, `approvalStatus: PENDING`

**Supervisor:** 3. Review absence request 4. Approve: `dayStatus` → `EXCUSED_ABSENCE`, `approvalStatus` → `APPROVED` 5. Reject: `approvalStatus` → `REJECTED`

---

### Incomplete Day Workflow

**Scenario:** Student checked in but forgot to check out

**Automatic:**

1. Record remains `dayStatus: INCOMPLETE`, `isIncomplete: true`

**Supervisor Options:**
2a. **Reclassify to HALF_DAY:** If student left early legitimately

```json
PATCH /attendance/:id/reclassify
{
  "dayStatus": "HALF_DAY",
  "comment": "Student left at 2 PM for medical appointment"
}
```

2b. **Reclassify to PRESENT_LATE/PRESENT_ON_TIME:** If manual verification shows full day worked

```json
PATCH /attendance/:id/reclassify
{
  "dayStatus": "PRESENT_ON_TIME",
  "comment": "Manually verified 8 hours worked, system checkout failed"
}
```

2c. **Reclassify to ABSENT:** If student didn't actually work

```json
PATCH /attendance/:id/reclassify
{
  "dayStatus": "ABSENT",
  "comment": "Company confirmed student didn't show up after check-in"
}
```

---

## Reporting & Analytics

### Attendance Summary

**Endpoint:** `GET /attendance/summary/:studentId`

**Returns:**

```json
{
  "total": 50,
  "presentOnTime": 30,
  "presentLate": 10,
  "halfDay": 3,
  "absent": 5,
  "excusedAbsence": 2,
  "incomplete": 0,
  "pending": 2,
  "approved": 45,
  "rejected": 1,
  "needsReview": 2,
  "completionPercentage": 86,
  "punctualityRate": 75,
  "anomalies": [
    {
      "type": "FREQUENT_LATENESS",
      "severity": "MEDIUM",
      "description": "25% late arrivals detected"
    },
    {
      "type": "CONSECUTIVE_ABSENCES",
      "severity": "HIGH",
      "description": "3 consecutive absences detected"
    }
  ]
}
```

### Anomaly Detection

System automatically flags:

1. **Frequent Lateness (MEDIUM)**: >30% late arrivals
2. **High Absence Rate (HIGH)**: >20% absences
3. **Frequent Incomplete Days (MEDIUM)**: >15% incomplete days
4. **Consecutive Absences (HIGH)**: ≥3 consecutive absences

---

## Frontend Integration Guide

### Student Dashboard Widget

```typescript
// Fetch today's status
const { data: todayAttendance } = useQuery({
  queryKey: ["attendance", "today"],
  queryFn: attendanceService.getTodayStatus,
  refetchInterval: 60000, // Refresh every minute
});

// Check-in button
const checkInMutation = useMutation({
  mutationFn: attendanceService.checkIn,
  onSuccess: () => {
    queryClient.invalidateQueries(["attendance", "today"]);
    toast.success("Checked in successfully!");
  },
});

// Check-out button
const checkOutMutation = useMutation({
  mutationFn: attendanceService.checkOut,
  onSuccess: (data) => {
    queryClient.invalidateQueries(["attendance", "today"]);
    toast.success(`Checked out! Hours worked: ${data.hoursWorked}`);
  },
});
```

**Display Logic:**

```typescript
{
  !todayAttendance && (
    <Button onClick={() => checkInMutation.mutate()}>Check In</Button>
  );
}

{
  todayAttendance && !todayAttendance.checkOutTime && (
    <>
      <Badge>Checked In: {formatTime(todayAttendance.checkInTime)}</Badge>
      <Badge
        variant={
          todayAttendance.punctuality === "ON_TIME" ? "success" : "warning"
        }
      >
        {todayAttendance.punctuality === "ON_TIME" ? "On Time" : "Late"}
      </Badge>
      <Button onClick={() => checkOutMutation.mutate()}>Check Out</Button>
    </>
  );
}

{
  todayAttendance?.checkOutTime && (
    <>
      <Badge variant="success">Checked Out</Badge>
      <p>Hours Worked: {todayAttendance.hoursWorked} hrs</p>
      <Badge>{formatDayStatus(todayAttendance.dayStatus)}</Badge>
    </>
  );
}
```

---

### Absence Request Form

```typescript
const absenceRequestMutation = useMutation({
  mutationFn: (data) => attendanceService.submitAbsenceRequest(data),
  onSuccess: () => {
    toast.success("Absence request submitted");
    form.reset();
  },
});

<Form
  onSubmit={form.handleSubmit((data) => absenceRequestMutation.mutate(data))}
>
  <DatePicker name="date" label="Date" minDate={new Date()} />
  <Textarea
    name="reason"
    label="Reason"
    required
    minLength={10}
    maxLength={500}
  />
  <Button type="submit">Submit Request</Button>
</Form>;
```

---

### Supervisor Approval Interface

```typescript
const approveMutation = useMutation({
  mutationFn: ({ id, comment }) =>
    attendanceService.approveAttendance(id, comment),
  onSuccess: () => {
    queryClient.invalidateQueries(["attendance", "pending"]);
    toast.success("Attendance approved");
  },
});

const rejectMutation = useMutation({
  mutationFn: ({ id, comment }) =>
    attendanceService.rejectAttendance(id, comment),
  onSuccess: () => {
    queryClient.invalidateQueries(["attendance", "pending"]);
    toast.success("Attendance rejected");
  },
});

const reclassifyMutation = useMutation({
  mutationFn: ({ id, dayStatus, comment }) =>
    attendanceService.reclassifyAttendance(id, dayStatus, comment),
  onSuccess: () => {
    queryClient.invalidateQueries(["attendance"]);
    toast.success("Day status reclassified");
  },
});
```

---

### Attendance Summary Display

```typescript
const { data: summary } = useQuery({
  queryKey: ["attendance", "summary", studentId],
  queryFn: () => attendanceService.getAttendanceSummary(studentId),
});

<Card>
  <h3>Attendance Summary</h3>

  <div className="stats-grid">
    <Stat label="Total Days" value={summary.total} />
    <Stat
      label="Present On Time"
      value={summary.presentOnTime}
      variant="success"
    />
    <Stat label="Present Late" value={summary.presentLate} variant="warning" />
    <Stat label="Half Days" value={summary.halfDay} />
    <Stat label="Absences" value={summary.absent} variant="danger" />
    <Stat label="Excused" value={summary.excusedAbsence} />
  </div>

  <Progress
    label="Completion Rate"
    value={summary.completionPercentage}
    max={100}
  />

  <Progress
    label="Punctuality Rate"
    value={summary.punctualityRate}
    max={100}
  />

  {summary.anomalies.length > 0 && (
    <div className="anomalies">
      <h4>⚠️ Flagged Issues</h4>
      {summary.anomalies.map((anomaly) => (
        <Alert key={anomaly.type} severity={anomaly.severity}>
          {anomaly.description}
        </Alert>
      ))}
    </div>
  )}
</Card>;
```

---

## Database Indexes

Ensure these indexes exist for optimal performance:

```javascript
// Compound unique index
{ student: 1, date: 1 } // Unique

// Query indexes
{ placement: 1, date: -1 }
{ dayStatus: 1 }
{ approvalStatus: 1 }
{ punctuality: 1 }
{ student: 1, date: -1 }
```

---

## Scheduled Jobs

### Auto-Absent Marking

**Cron Expression:** `0 1 * * *` (Runs at 1:00 AM daily)

```javascript
// Node Cron example
const cron = require("node-cron");
const attendanceService = require("./services/attendanceService");

cron.schedule("0 1 * * *", async () => {
  console.log("Running auto-absent marking for yesterday...");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const absentRecords = await attendanceService.markAbsent(yesterday);
  console.log(`Marked ${absentRecords.length} students as absent`);
});
```

**Alternative:** Coordinator can manually trigger via UI button that calls `POST /attendance/mark-absent`.

---

## Migration Guide

### Migrating Existing Attendance Data

If you have existing attendance records with the old schema:

```javascript
// Migration script
const Attendance = require("./models/Attendance");

async function migrateAttendanceRecords() {
  const oldRecords = await Attendance.find({
    dayStatus: { $exists: false },
  });

  for (const record of oldRecords) {
    // Map old status to new dayStatus
    if (record.status === "present") {
      record.dayStatus =
        record.checkInTime.getHours() <= 8 &&
        record.checkInTime.getMinutes() <= 15
          ? "PRESENT_ON_TIME"
          : "PRESENT_LATE";
    } else if (record.status === "late") {
      record.dayStatus = "PRESENT_LATE";
    } else if (record.status === "absent") {
      record.dayStatus = "ABSENT";
    }

    // Set default approval status
    record.approvalStatus = record.acknowledgedBy ? "APPROVED" : "PENDING";

    // Calculate punctuality if checkInTime exists
    if (record.checkInTime) {
      const hours = record.checkInTime.getHours();
      const minutes = record.checkInTime.getMinutes();
      record.punctuality =
        hours < 8 || (hours === 8 && minutes <= 15) ? "ON_TIME" : "LATE";
    }

    await record.save();
  }

  console.log(`Migrated ${oldRecords.length} attendance records`);
}
```

---

## Best Practices

### For Students

1. **Check in early**: Aim for before 8:15 AM to get ON_TIME status
2. **Always check out**: Avoid INCOMPLETE status by checking out before leaving
3. **Absence requests**: Submit with clear, valid reasons to improve approval chances
4. **GPS accuracy**: Enable location services for accurate check-in/out

### For Supervisors

1. **Review promptly**: Process absence requests within 24-48 hours
2. **Provide comments**: Always add meaningful comments when approving/rejecting
3. **Reclassify judiciously**: Only reclassify when there's clear evidence of system error or special circumstances
4. **Monitor anomalies**: Check attendance summaries weekly for flagged issues

### For Coordinators

1. **Run mark-absent daily**: Ensure no students slip through without records
2. **Review summaries**: Monitor department-wide completion and punctuality rates
3. **Investigate anomalies**: Follow up on students with frequent lateness or absences
4. **Spot-check approvals**: Audit supervisor approval patterns for consistency

---

## Security Considerations

1. **GPS spoofing**: Consider implementing IP-based validation or geofencing
2. **Timestamp tampering**: Server-side timestamps prevent client manipulation
3. **Role-based access**: Supervisors can only access assigned students
4. **Immutable punctuality**: Cannot be changed after check-in prevents fraud
5. **Audit trail**: All supervisor actions logged with timestamps

---

## Testing

Use the provided test file:

```bash
cd backend
node test_attendance_evaluation.js
```

Update tokens and IDs in the test file before running.

---

## Support

For issues or questions:

- Check API responses for detailed error messages
- Review anomaly flags in attendance summaries
- Contact system administrator for permission issues
- Report bugs with attendance ID and timestamp for debugging
