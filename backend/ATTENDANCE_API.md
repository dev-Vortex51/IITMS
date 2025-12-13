# Attendance Tracking API Documentation

## Overview

The Attendance module enables daily check-in tracking for students during their industrial training. Students can check in once per day, and supervisors can view and acknowledge attendance records.

## Features

- **Daily Check-In**: Students check in once per day with optional location and notes
- **Automatic Late Detection**: Check-ins after 9:00 AM are marked as "late"
- **Location Tracking**: Optional GPS coordinates capture for verification
- **Supervisor Acknowledgment**: Supervisors can acknowledge student check-ins
- **Statistics**: Attendance rate, streaks, and comprehensive statistics
- **History**: View attendance records with filters (date range, status)

## Attendance Model

### Schema

```javascript
{
  student: ObjectId (ref: Student),
  placement: ObjectId (ref: Placement),
  date: Date (midnight timestamp for the day),
  checkInTime: Date (actual check-in timestamp),
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  notes: String (max 500 chars),
  status: String (enum: "present", "late", "absent"),
  acknowledgedBy: ObjectId (ref: Supervisor),
  acknowledgedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Status Rules

- **present**: Checked in before 9:00 AM
- **late**: Checked in at or after 9:00 AM
- **absent**: No check-in for the day (manually marked)

### Constraints

- **Unique Index**: One attendance record per student per day (`student + date`)
- **Required**: student, placement, date, checkInTime
- **Optional**: location, notes, acknowledgedBy, acknowledgedAt

## API Endpoints

### Student Endpoints

#### POST /api/v1/attendance/check-in

**Description**: Student checks in for the current day

**Access**: Student only

**Request Body**:

```json
{
  "location": {
    "latitude": 6.4541,
    "longitude": 3.3947,
    "address": "Lagos, Nigeria" // optional
  },
  "notes": "Starting work on the new feature today" // optional
}
```

**Response** (201):

```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "_id": "...",
    "student": { ... },
    "placement": { ... },
    "date": "2024-01-15T00:00:00.000Z",
    "checkInTime": "2024-01-15T08:45:23.000Z",
    "status": "present",
    "location": { ... },
    "notes": "..."
  },
  "meta": {
    "status": "present",
    "checkInTime": "2024-01-15T08:45:23.000Z"
  }
}
```

**Errors**:

- 400: Already checked in today
- 400: No approved placement found
- 401: Unauthorized

---

#### GET /api/v1/attendance/today

**Description**: Get today's check-in status

**Access**: Student only

**Response** (200):

```json
{
  "success": true,
  "message": "Check-in record found",
  "data": {
    "_id": "...",
    "checkInTime": "2024-01-15T08:45:23.000Z",
    "status": "present"
    // ... full attendance record
  }
}
```

**Response** (200 - Not Checked In):

```json
{
  "success": true,
  "message": "Not checked in today",
  "data": null
}
```

---

#### GET /api/v1/attendance/my-attendance

**Description**: Get student's own attendance history

**Access**: Student only

**Query Parameters**:

- `startDate` (string): Start date in YYYY-MM-DD format (optional)
- `endDate` (string): End date in YYYY-MM-DD format (optional)
- `status` (string): Filter by status - "present", "late", "absent" (optional)

**Example**: `/api/v1/attendance/my-attendance?startDate=2024-01-01&endDate=2024-01-31&status=present`

**Response** (200):

```json
{
  "success": true,
  "message": "Attendance history retrieved successfully",
  "data": [
    {
      "_id": "...",
      "date": "2024-01-15T00:00:00.000Z",
      "checkInTime": "2024-01-15T08:45:23.000Z",
      "status": "present",
      "notes": "...",
      "acknowledgedBy": { ... } // null if not acknowledged
    }
    // ... more records
  ],
  "meta": {
    "count": 25
  }
}
```

---

#### GET /api/v1/attendance/my-stats

**Description**: Get student's attendance statistics

**Access**: Student only

**Response** (200):

```json
{
  "success": true,
  "message": "Attendance statistics retrieved successfully",
  "data": {
    "total": 50,
    "present": 42,
    "late": 5,
    "absent": 3,
    "attendanceRate": 94.0,
    "currentStreak": 7
  }
}
```

### Supervisor/Coordinator Endpoints

#### GET /api/v1/attendance/student/:studentId

**Description**: Get attendance history for a specific student

**Access**: Admin, Coordinator (own department), Supervisor (assigned students)

**Path Parameters**:

- `studentId` (string): Student ID

**Query Parameters**:

- `startDate`, `endDate`, `status` (same as my-attendance)

**Response** (200):

```json
{
  "success": true,
  "message": "Student attendance retrieved successfully",
  "data": [
    /* attendance records */
  ],
  "meta": { "count": 25 }
}
```

**Errors**:

- 403: Not authorized to view this student
- 404: Student not found

---

#### GET /api/v1/attendance/student/:studentId/stats

**Description**: Get attendance statistics for a specific student

**Access**: Admin, Coordinator, Supervisor

**Response** (200):

```json
{
  "success": true,
  "message": "Student attendance statistics retrieved successfully",
  "data": {
    "total": 50,
    "present": 42,
    "late": 5,
    "absent": 3,
    "attendanceRate": 94.0,
    "currentStreak": 7
  }
}
```

---

#### GET /api/v1/attendance/placement/:placementId

**Description**: Get attendance records for all students in a placement

**Access**: Supervisor (assigned to placement), Coordinator, Admin

**Path Parameters**:

- `placementId` (string): Placement ID

**Query Parameters**:

- `startDate`, `endDate`, `status` (same as above)

**Response** (200):

```json
{
  "success": true,
  "message": "Placement attendance retrieved successfully",
  "data": [
    /* attendance records */
  ],
  "meta": { "count": 120 }
}
```

---

#### POST /api/v1/attendance/:attendanceId/acknowledge

**Description**: Supervisor acknowledges a student's attendance

**Access**: Supervisor (assigned to the student)

**Path Parameters**:

- `attendanceId` (string): Attendance record ID

**Response** (200):

```json
{
  "success": true,
  "message": "Attendance acknowledged successfully",
  "data": {
    "_id": "...",
    "acknowledgedBy": {
      "_id": "...",
      "user": {
        "firstName": "John",
        "lastName": "Supervisor"
      }
    },
    "acknowledgedAt": "2024-01-15T10:30:00.000Z"
    // ... full attendance record
  }
}
```

**Errors**:

- 403: Not assigned to this student
- 404: Attendance record not found

## Frontend Integration

### Services

```typescript
import { attendanceService } from "@/services/attendance.service";

// Student check-in
const checkIn = async () => {
  const location = await getLocation(); // Optional
  const result = await attendanceService.checkIn({
    location,
    notes: "Working on project X",
  });
};

// Get today's status
const todayStatus = await attendanceService.getTodayCheckIn();

// Get history
const history = await attendanceService.getMyAttendance({
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  status: "present",
});

// Get stats
const stats = await attendanceService.getMyStats();
```

### React Query Hooks

```typescript
// Today's check-in status
const { data: todayCheckIn } = useQuery({
  queryKey: ["attendance", "today"],
  queryFn: () => attendanceService.getTodayCheckIn(),
  refetchInterval: 30000, // Refresh every 30s
});

// Attendance stats
const { data: stats } = useQuery({
  queryKey: ["attendance", "stats"],
  queryFn: () => attendanceService.getMyStats(),
});

// Check-in mutation
const checkInMutation = useMutation({
  mutationFn: attendanceService.checkIn,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
  },
});
```

## Use Cases

### 1. Student Daily Check-In Flow

1. Student navigates to dashboard
2. If placement is approved, attendance widget appears
3. If not checked in today:
   - Shows check-in button
   - Optional: Capture GPS location
   - Optional: Add notes
   - Click "Check In Now"
4. If checked in:
   - Display check-in time
   - Show status badge (Present/Late)
   - Show notes (if any)
   - Show acknowledgment status

### 2. Supervisor Monitoring

1. Supervisor views assigned students
2. Clicks on student to view details
3. Views attendance tab with:
   - Current month attendance grid
   - Statistics (rate, streak)
   - Recent check-ins list
4. Can acknowledge individual check-ins

### 3. Coordinator Department Overview

1. Coordinator dashboard shows department stats
2. Can view individual student attendance
3. Filter by:
   - Date range
   - Status (present/late/absent)
   - Student
4. Export attendance reports

## Business Rules

1. **One Check-In Per Day**: Students can only check in once per day (enforced by unique index)
2. **Placement Requirement**: Student must have an approved placement to check in
3. **Late Threshold**: 9:00 AM is the cutoff for on-time check-ins
4. **Time Zone**: All timestamps in UTC; convert to local time on frontend
5. **Location Optional**: Location capture is optional but recommended
6. **Supervisor Access**: Supervisors can only view attendance for their assigned students
7. **Coordinator Department Scope**: Coordinators can only view attendance for students in their department

## Performance Considerations

- **Indexes**: Compound index on (student, date) for fast lookups
- **Date Queries**: Use midnight timestamps for consistent date-based queries
- **Caching**: Frontend caches today's check-in status (30s refresh)
- **Pagination**: Not implemented yet (consider for large datasets)

## Future Enhancements

- [ ] Bulk attendance marking for absent students (coordinator feature)
- [ ] Geofencing (check-in only within company radius)
- [ ] QR code check-in at company premises
- [ ] Push notifications for check-in reminders
- [ ] Weekly/monthly attendance reports (PDF export)
- [ ] Attendance calendar view
- [ ] Absence request workflow (sick leave, permission)
- [ ] Integration with assessment scoring (attendance weight)
