# IITMS Exhaustive ASCII Wireframes (No-Guesswork Handoff)

Generated from route source files in `client/src/app/**/page.tsx`.
Each route contains page content signals, component inventory, and explicit state scenario frames.

---

## Route: `/admin/academic-supervisors/create`

Page Source: [client/src/app/admin/academic-supervisors/create/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/academic-supervisors/create/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/academic-supervisors/create                                     |
| FILE  : client/src/app/admin/academic-supervisors/create/page.tsx              |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - ArrowLeft                                                                   |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Input                                                                       |
| - Label                                                                       |
| - Link                                                                        |
| - Save                                                                        |
| - Select                                                                      |
| - SelectContent                                                               |
| - SelectItem                                                                  |
| - SelectTrigger                                                               |
| - SelectValue                                                                 |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/services/admin.service -> client/src/services/admin.service               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
| - next/navigation -> next/navigation                                          |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: Yes    Empty: No     Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: ArrowLeft, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/academic-supervisors`

Page Source: [client/src/app/admin/academic-supervisors/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/academic-supervisors/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/academic-supervisors                                            |
| FILE  : client/src/app/admin/academic-supervisors/page.tsx                     |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Badge                                                                       |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Eye                                                                         |
| - GraduationCap                                                               |
| - Link                                                                        |
| - Mail                                                                        |
| - Pagination                                                                  |
| - PaginationContent                                                           |
| - PaginationItem                                                              |
| - PaginationLink                                                              |
| - PaginationNext                                                              |
| - PaginationPrevious                                                          |
| - Phone                                                                       |
| - Plus                                                                        |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/hooks/usePagination -> client/src/hooks/usePagination                     |
| - @/services/admin.service -> client/src/services/admin.service               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Eye] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/coordinators/create`

Page Source: [client/src/app/admin/coordinators/create/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/coordinators/create/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/coordinators/create                                             |
| FILE  : client/src/app/admin/coordinators/create/page.tsx                      |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - ArrowLeft                                                                   |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Input                                                                       |
| - Label                                                                       |
| - Link                                                                        |
| - Select                                                                      |
| - SelectContent                                                               |
| - SelectItem                                                                  |
| - SelectTrigger                                                               |
| - SelectValue                                                                 |
| - UserCog                                                                     |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/services/admin.service -> client/src/services/admin.service               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
| - next/navigation -> next/navigation                                          |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: Yes    Empty: Yes    Success: Yes    Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: ArrowLeft, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/coordinators`

Page Source: [client/src/app/admin/coordinators/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/coordinators/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/coordinators                                                    |
| FILE  : client/src/app/admin/coordinators/page.tsx                             |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Badge                                                                       |
| - Building                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Eye                                                                         |
| - Link                                                                        |
| - Mail                                                                        |
| - Pagination                                                                  |
| - PaginationContent                                                           |
| - PaginationEllipsis                                                          |
| - PaginationItem                                                              |
| - PaginationLink                                                              |
| - PaginationNext                                                              |
| - PaginationPrevious                                                          |
| - UserCog                                                                     |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/hooks/usePagination -> client/src/hooks/usePagination                     |
| - @/services/admin.service -> client/src/services/admin.service               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Badge, Building, Button, Card, CardContent, CardDescription, CardHeader, CardTitle] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/dashboard`

Page Source: [client/src/app/admin/dashboard/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/dashboard/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/dashboard                                                       |
| FILE  : client/src/app/admin/dashboard/page.tsx                                |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - DashboardCharts                                                             |
| - QuickActions                                                                |
| - RecentActivity                                                              |
| - Skeleton                                                                    |
| - StatsGrid                                                                   |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/DashboardCharts -> ./components/DashboardCharts                |
| - ./components/QuickActions -> ./components/QuickActions                      |
| - ./components/RecentActivity -> ./components/RecentActivity                  |
| - ./components/StatsGrid -> ./components/StatsGrid                            |
| - ./hooks/useAdminDashboardData -> ./hooks/useAdminDashboardData              |
| - @/components/ui/skeleton -> client/src/components/ui/skeleton               |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: No     Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: DashboardCharts, QuickActions, RecentActivity, Skeleton, StatsGrid] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/departments/[id]`

Page Source: [client/src/app/admin/departments/[id]/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/departments/[id]/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/departments/[id]                                                |
| FILE  : client/src/app/admin/departments/[id]/page.tsx                         |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - DepartmentCoordinators                                                      |
| - DepartmentHeader                                                            |
| - DepartmentOverview                                                          |
| - Skeleton                                                                    |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./_components/DepartmentCoordinators -> ./_components/DepartmentCoordinators|
| - ./_components/DepartmentHeader -> ./_components/DepartmentHeader            |
| - ./_components/DepartmentOverview -> ./_components/DepartmentOverview        |
| - ./_hooks/useDepartmentDetails -> ./_hooks/useDepartmentDetails              |
| - @/components/ui/skeleton -> client/src/components/ui/skeleton               |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: No     Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: DepartmentCoordinators, DepartmentHeader, DepartmentOverview, Skeleton] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/departments`

Page Source: [client/src/app/admin/departments/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/departments/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/departments                                                     |
| FILE  : client/src/app/admin/departments/page.tsx                              |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - AssignCoordinator                                                           |
| - Building                                                                    |
| - CreateDepartment                                                            |
| - DepartmentCard                                                              |
| - DepartmentFilters                                                           |
| - Pagination                                                                  |
| - PaginationContent                                                           |
| - PaginationEllipsis                                                          |
| - PaginationItem                                                              |
| - PaginationLink                                                              |
| - PaginationNext                                                              |
| - PaginationPrevious                                                          |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./_components/AssignCoordinator -> ./_components/AssignCoordinator          |
| - ./_components/CreateDepartment -> ./_components/CreateDepartment            |
| - ./_components/DepartmentCard -> ./_components/DepartmentCard                |
| - ./_components/DepartmentFilters -> ./_components/DepartmentFilters          |
| - ./_hooks/useDepartmentsLogic -> ./_hooks/useDepartmentsLogic                |
| - @/hooks/usePagination -> client/src/hooks/usePagination                     |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: AssignCoordinator, Building, CreateDepartment, DepartmentCard, DepartmentFilters, Pagination, PaginationContent, PaginationEllipsis] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/faculties/[id]`

Page Source: [client/src/app/admin/faculties/[id]/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/faculties/[id]/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/faculties/[id]                                                  |
| FILE  : client/src/app/admin/faculties/[id]/page.tsx                           |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - FacultyDepartments                                                          |
| - FacultyHeader                                                               |
| - FacultyOverview                                                             |
| - Link                                                                        |
| - School                                                                      |
| - Skeleton                                                                    |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./_components/FacultyDepartments -> ./_components/FacultyDepartments        |
| - ./_components/FacultyHeader -> ./_components/FacultyHeader                  |
| - ./_components/FacultyOverview -> ./_components/FacultyOverview              |
| - ./_hooks/useFacultyDetails -> ./_hooks/useFacultyDetails                    |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/skeleton -> client/src/components/ui/skeleton               |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: No     Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, FacultyDepartments, FacultyHeader, FacultyOverview, Link, School, Skeleton] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/faculties`

Page Source: [client/src/app/admin/faculties/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/faculties/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/faculties                                                       |
| FILE  : client/src/app/admin/faculties/page.tsx                                |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Building                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Dialog                                                                      |
| - DialogContent                                                               |
| - DialogDescription                                                           |
| - DialogHeader                                                                |
| - DialogTitle                                                                 |
| - DialogTrigger                                                               |
| - Edit                                                                        |
| - Input                                                                       |
| - Label                                                                       |
| - Link                                                                        |
| - LoadingCard                                                                 |
| - Plus                                                                        |
| - School                                                                      |
| - ...more JSX component tags exist in file                                    |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - @/services/admin.service -> client/src/services/admin.service               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: Yes    Success: Yes    Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Building, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/invitations`

Page Source: [client/src/app/admin/invitations/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/invitations/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/invitations                                                     |
| FILE  : client/src/app/admin/invitations/page.tsx                              |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Badge                                                                       |
| - Ban                                                                         |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - CheckCircle2                                                                |
| - Clock                                                                       |
| - Dialog                                                                      |
| - DialogContent                                                               |
| - DialogDescription                                                           |
| - DialogFooter                                                                |
| - DialogHeader                                                                |
| - DialogTitle                                                                 |
| - Input                                                                       |
| - Label                                                                       |
| - Mail                                                                        |
| - Plus                                                                        |
| - ...more JSX component tags exist in file                                    |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/services/admin.service -> client/src/services/admin.service               |
| - @/services/invitation.service -> client/src/services/invitation.service     |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - date-fns -> date-fns                                                        |
| - next/link -> next/link                                                      |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: Yes    Success: Yes    Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Badge, Ban, Button, Card, CardContent, CardDescription, CardHeader, CardTitle] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/reports`

Page Source: [client/src/app/admin/reports/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/reports/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/reports                                                         |
| FILE  : client/src/app/admin/reports/page.tsx                                  |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Building                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Download                                                                    |
| - FileBarChart                                                                |
| - FileText                                                                    |
| - Label                                                                       |
| - Pagination                                                                  |
| - PaginationContent                                                           |
| - PaginationEllipsis                                                          |
| - PaginationItem                                                              |
| - PaginationLink                                                              |
| - PaginationNext                                                              |
| - PaginationPrevious                                                          |
| - School                                                                      |
| - Select                                                                      |
| - ...more JSX component tags exist in file                                    |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/hooks/usePagination -> client/src/hooks/usePagination                     |
| - @/services/admin.service -> client/src/services/admin.service               |
| - @/services/student.service -> client/src/services/student.service           |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: No     Empty: No     Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Building, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Download] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/admin/settings`

Page Source: [client/src/app/admin/settings/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/admin/settings/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /admin/settings                                                        |
| FILE  : client/src/app/admin/settings/page.tsx                                 |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Bell                                                                        |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Database                                                                    |
| - Input                                                                       |
| - Label                                                                       |
| - Lock                                                                        |
| - Mail                                                                        |
| - Separator                                                                   |
| - Shield                                                                      |
| - Switch                                                                      |
| - User                                                                        |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/separator -> client/src/components/ui/separator             |
| - @/components/ui/switch -> client/src/components/ui/switch                   |
| - @/services/auth.service -> client/src/services/auth.service                 |
| - @/services/settings.service -> client/src/services/settings.service         |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: No     Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Bell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Database] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/dashboard`

Page Source: [client/src/app/coordinator/dashboard/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/dashboard/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/dashboard                                                 |
| FILE  : client/src/app/coordinator/dashboard/page.tsx                          |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - ActionSidebar                                                               |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - DashboardCharts                                                             |
| - StatusBadge                                                                 |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/ActionSidebar -> ./components/ActionSidebar                    |
| - ./components/DashboardCharts -> ./components/DashboardCharts                |
| - ./hooks/useCoordinatorDashboard -> ./hooks/useCoordinatorDashboard          |
| - @/components/ui/card -> client/src/components/ui/card                       |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: ActionSidebar, Card, CardContent, CardHeader, CardTitle, DashboardCharts, StatusBadge] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/invitations`

Page Source: [client/src/app/coordinator/invitations/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/invitations/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/invitations                                               |
| FILE  : client/src/app/coordinator/invitations/page.tsx                        |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - Card                                                                        |
| - CreateInvitationDialog                                                      |
| - Input                                                                       |
| - InvitationMetrics                                                           |
| - Mail                                                                        |
| - Plus                                                                        |
| - RefreshCw                                                                   |
| - Search                                                                      |
| - Select                                                                      |
| - SelectContent                                                               |
| - SelectItem                                                                  |
| - SelectTrigger                                                               |
| - SelectValue                                                                 |
| - StatusBadge                                                                 |
| - Table                                                                       |
| - TableBody                                                                   |
| - TableCell                                                                   |
| - TableHead                                                                   |
| - TableHeader                                                                 |
| - ...more JSX component tags exist in file                                    |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/CreateInvitationDialog -> ./components/CreateInvitationDialog  |
| - ./components/InvitationMetrics -> ./components/InvitationMetrics            |
| - ./hooks/useInvitations -> ./hooks/useInvitations                            |
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/card -> client/src/components/ui/card                       |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - date-fns -> date-fns                                                        |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, Card, CreateInvitationDialog, Input, InvitationMetrics, Mail, Plus, RefreshCw] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/placements`

Page Source: [client/src/app/coordinator/placements/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/placements/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/placements                                                |
| FILE  : client/src/app/coordinator/placements/page.tsx                         |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - PlacementFilters                                                            |
| - PlacementList                                                               |
| - PlacementMetrics                                                            |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/PlacementFilters -> ./components/PlacementFilters              |
| - ./components/PlacementList -> ./components/PlacementList                    |
| - ./components/PlacementMetrics -> ./components/PlacementMetrics              |
| - ./hooks/usePlacements -> ./hooks/usePlacements                              |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: No     Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: PlacementFilters, PlacementList, PlacementMetrics           ] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/reports`

Page Source: [client/src/app/coordinator/reports/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/reports/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/reports                                                   |
| FILE  : client/src/app/coordinator/reports/page.tsx                            |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Briefcase                                                                   |
| - Building                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - FileDown                                                                    |
| - FileSpreadsheet                                                             |
| - FileText                                                                    |
| - Select                                                                      |
| - SelectContent                                                               |
| - SelectItem                                                                  |
| - SelectTrigger                                                               |
| - SelectValue                                                                 |
| - Separator                                                                   |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/separator -> client/src/components/ui/separator             |
| - @/services/admin.service -> client/src/services/admin.service               |
| - @/services/student.service -> client/src/services/student.service           |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: No     Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Briefcase, Building, Button, Card, CardContent, CardDescription, CardHeader, CardTitle] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/settings`

Page Source: [client/src/app/coordinator/settings/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/settings/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/settings                                                  |
| FILE  : client/src/app/coordinator/settings/page.tsx                           |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - ProfileCard                                                                 |
| - SecurityCard                                                                |
| - SystemPreferencesCard                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/ProfileCard -> ./components/ProfileCard                        |
| - ./components/SecurityCard -> ./components/SecurityCard                      |
| - ./components/SystemPreferencesCard -> ./components/SystemPreferencesCard    |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: No     Empty: No     Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: ProfileCard, SecurityCard, SystemPreferencesCard            ] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/students/[id]`

Page Source: [client/src/app/coordinator/students/[id]/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/students/[id]/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/students/[id]                                             |
| FILE  : client/src/app/coordinator/students/[id]/page.tsx                      |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - Link                                                                        |
| - Loading                                                                     |
| - StudentActivitySummary                                                      |
| - StudentPersonalInfoCard                                                     |
| - StudentPlacementCard                                                        |
| - StudentProfileHeader                                                        |
| - StudentSupervisorsCard                                                      |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./_components/StudentActivitySummary -> ./_components/StudentActivitySummary|
| - ./_components/StudentPersonalInfoCard -> ./_components/StudentPersonalInfoCard|
| - ./_components/StudentPlacementCard -> ./_components/StudentPlacementCard    |
| - ./_components/StudentProfileHeader -> ./_components/StudentProfileHeader    |
| - ./_components/StudentSupervisorsCard -> ./_components/StudentSupervisorsCard|
| - ./_hooks/useStudentDetails -> ./_hooks/useStudentDetails                    |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - next/link -> next/link                                                      |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: No     Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, Link, Loading, StudentActivitySummary, StudentPersonalInfoCard, StudentPlacementCard, StudentProfileHeader, StudentSupervisorsCard] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/students/[id]/placement`

Page Source: [client/src/app/coordinator/students/[id]/placement/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/students/[id]/placement/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/students/[id]/placement                                   |
| FILE  : client/src/app/coordinator/students/[id]/placement/page.tsx            |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - ArrowLeft                                                                   |
| - Briefcase                                                                   |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - Link                                                                        |
| - Loading                                                                     |
| - PlacementCompanyCard                                                        |
| - PlacementHeader                                                             |
| - PlacementReviewAction                                                       |
| - PlacementStatusCard                                                         |
| - PlacementSupervisorCard                                                     |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./_components/PlacementCompanyCard -> ./_components/PlacementCompanyCard    |
| - ./_components/PlacementHeader -> ./_components/PlacementHeader              |
| - ./_components/PlacementReviewAction -> ./_components/PlacementReviewAction  |
| - ./_components/PlacementStatusCard -> ./_components/PlacementStatusCard      |
| - ./_components/PlacementSupervisorCard -> ./_components/PlacementSupervisorCard|
| - ./_hooks/usePlacementReview -> ./_hooks/usePlacementReview                  |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/card -> client/src/components/ui/card                       |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: ArrowLeft, Briefcase, Button, Card, CardContent, Link, Loading, PlacementCompanyCard] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/students/[id]/supervisors`

Page Source: [client/src/app/coordinator/students/[id]/supervisors/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/students/[id]/supervisors/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/students/[id]/supervisors                                 |
| FILE  : client/src/app/coordinator/students/[id]/supervisors/page.tsx          |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - AlertCircle                                                                 |
| - ArrowLeft                                                                   |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CurrentSupervisors                                                          |
| - Link                                                                        |
| - Loading                                                                     |
| - SupervisorAssignmentForm                                                    |
| - SupervisorHeader                                                            |
| - SupervisorPlacementInfo                                                     |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./_components/CurrentSupervisors -> ./_components/CurrentSupervisors        |
| - ./_components/SupervisorAssignmentForm -> ./_components/SupervisorAssignmentForm|
| - ./_components/SupervisorHeader -> ./_components/SupervisorHeader            |
| - ./_components/SupervisorPlacementInfo -> ./_components/SupervisorPlacementInfo|
| - ./_hooks/useSupervisorAssignment -> ./_hooks/useSupervisorAssignment        |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/card -> client/src/components/ui/card                       |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: AlertCircle, ArrowLeft, Button, Card, CardContent, CurrentSupervisors, Link, Loading] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/students`

Page Source: [client/src/app/coordinator/students/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/students/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/students                                                  |
| FILE  : client/src/app/coordinator/students/page.tsx                           |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - StudentHeader                                                               |
| - StudentList                                                                 |
| - StudentSearch                                                               |
| - StudentStats                                                                |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./_components/StudentHeader -> ./_components/StudentHeader                  |
| - ./_components/StudentList -> ./_components/StudentList                      |
| - ./_components/StudentSearch -> ./_components/StudentSearch                  |
| - ./_components/StudentStats -> ./_components/StudentStats                    |
| - ./_hooks/useCoordinatorStudents -> ./_hooks/useCoordinatorStudents          |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: No     Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: StudentHeader, StudentList, StudentSearch, StudentStats     ] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/supervisors/[id]`

Page Source: [client/src/app/coordinator/supervisors/[id]/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/supervisors/[id]/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/supervisors/[id]                                          |
| FILE  : client/src/app/coordinator/supervisors/[id]/page.tsx                   |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - AlertCircle                                                                 |
| - AssignedStudentsList                                                        |
| - BookOpen                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Link                                                                        |
| - Loading                                                                     |
| - SupervisorInfoCard                                                          |
| - SupervisorMetrics                                                           |
| - SupervisorProfileHeader                                                     |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/AssignedStudentsList -> ./components/AssignedStudentsList      |
| - ./components/SupervisorInfoCard -> ./components/SupervisorInfoCard          |
| - ./components/SupervisorMetrics -> ./components/SupervisorMetrics            |
| - ./components/SupervisorProfileHeader -> ./components/SupervisorProfileHeader|
| - ./hooks/useSupervisorDetails -> ./hooks/useSupervisorDetails                |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: AlertCircle, AssignedStudentsList, BookOpen, Button, Card, CardContent, CardDescription, CardHeader] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/coordinator/supervisors`

Page Source: [client/src/app/coordinator/supervisors/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/coordinator/supervisors/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /coordinator/supervisors                                               |
| FILE  : client/src/app/coordinator/supervisors/page.tsx                        |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - CreateSupervisorDialog                                                      |
| - Input                                                                       |
| - Plus                                                                        |
| - Search                                                                      |
| - SupervisorCard                                                              |
| - SupervisorGrid                                                              |
| - SupervisorMetrics                                                           |
| - Tabs                                                                        |
| - TabsContent                                                                 |
| - TabsList                                                                    |
| - TabsTrigger                                                                 |
| - Users2                                                                      |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/CreateSupervisorDialog -> ./components/CreateSupervisorDialog  |
| - ./components/SupervisorCard -> ./components/SupervisorCard                  |
| - ./components/SupervisorMetrics -> ./components/SupervisorMetrics            |
| - ./hooks/useSupervisors -> ./hooks/useSupervisors                            |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/tabs -> client/src/components/ui/tabs                       |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, CreateSupervisorDialog, Input, Plus, Search, SupervisorCard, SupervisorGrid, SupervisorMetrics] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/d-supervisor/assessments`

Page Source: [client/src/app/d-supervisor/assessments/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/d-supervisor/assessments/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /d-supervisor/assessments                                              |
| FILE  : client/src/app/d-supervisor/assessments/page.tsx                       |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - All Assessments                                                             |
| - Assessments awaiting review or approval                                     |
| - Completed Assessments                                                       |
| - Description: Assessments awaiting review or approval                        |
| - Description: Submitted, approved, or rejected assessments                   |
| - Description: View and manage all student assessments                        |
| - No completed assessments                                                    |
| - No pending assessments                                                      |
| - Pending Assessments                                                         |
| - Submitted, approved, or rejected assessments                                |
| - Title: All Assessments                                                      |
| - Title: Completed Assessments                                                |
| - Title: Pending Assessments                                                  |
| - View and manage all student assessments                                     |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - AssessmentCreateDialog                                                      |
| - AssessmentDetailsDialog                                                     |
| - AssessmentStats                                                             |
| - AssessmentTable                                                             |
| - AssessmentsHeader                                                           |
| - Tabs                                                                        |
| - TabsContent                                                                 |
| - TabsList                                                                    |
| - TabsTrigger                                                                 |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/AssessmentCreateDialog -> ./components/AssessmentCreateDialog  |
| - ./components/AssessmentDetailsDialog -> ./components/AssessmentDetailsDialog|
| - ./components/AssessmentStats -> ./components/AssessmentStats                |
| - ./components/AssessmentTable -> ./components/AssessmentTable                |
| - ./components/AssessmentsHeader -> ./components/AssessmentsHeader            |
| - ./hooks/useSupervisorAssessments -> ./hooks/useSupervisorAssessments        |
| - @/components/ui/tabs -> client/src/components/ui/tabs                       |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: AssessmentCreateDialog, AssessmentDetailsDialog, AssessmentStats, AssessmentTable, AssessmentsHeader, Tabs, TabsContent, TabsList] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/d-supervisor/attendance`

Page Source: [client/src/app/d-supervisor/attendance/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/d-supervisor/attendance/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /d-supervisor/attendance                                               |
| FILE  : client/src/app/d-supervisor/attendance/page.tsx                        |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - FileText                                                                    |
| - SupervisorApprovalInterface                                                 |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/attendance/supervisor-approval -> client/src/components/attendance/supervisor-approval|
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/services/placement.service -> client/src/services/placement.service       |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Card, CardContent, CardDescription, CardHeader, CardTitle, FileText, SupervisorApprovalInterface, Users] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/d-supervisor/dashboard`

Page Source: [client/src/app/d-supervisor/dashboard/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/d-supervisor/dashboard/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /d-supervisor/dashboard                                                |
| FILE  : client/src/app/d-supervisor/dashboard/page.tsx                         |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - BookOpen                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - CheckCircle                                                                 |
| - Link                                                                        |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/card -> client/src/components/ui/card                       |
| - @/lib/api-client -> client/src/lib/api-client                               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: No     Empty: Yes    Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: BookOpen, Button, Card, CardContent, CardHeader, CardTitle, CheckCircle, Link] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/d-supervisor/evaluations`

Page Source: [client/src/app/d-supervisor/evaluations/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/d-supervisor/evaluations/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /d-supervisor/evaluations                                              |
| FILE  : client/src/app/d-supervisor/evaluations/page.tsx                       |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Badge                                                                       |
| - Button                                                                      |
| - Calendar                                                                    |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - ClipboardCheck                                                              |
| - Eye                                                                         |
| - Input                                                                       |
| - LoadingCard                                                                 |
| - Plus                                                                        |
| - Search                                                                      |
| - Select                                                                      |
| - SelectContent                                                               |
| - SelectItem                                                                  |
| - SelectTrigger                                                               |
| - SelectValue                                                                 |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Badge, Button, Calendar, Card, CardContent, CardDescription, CardHeader, CardTitle] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/d-supervisor/logbooks`

Page Source: [client/src/app/d-supervisor/logbooks/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/d-supervisor/logbooks/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /d-supervisor/logbooks                                                 |
| FILE  : client/src/app/d-supervisor/logbooks/page.tsx                          |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - AlertCircle                                                                 |
| - ArrowLeft                                                                   |
| - Badge                                                                       |
| - BookOpen                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - CheckCircle                                                                 |
| - ChevronRight                                                                |
| - Clock                                                                       |
| - Dialog                                                                      |
| - DialogContent                                                               |
| - DialogDescription                                                           |
| - DialogFooter                                                                |
| - DialogHeader                                                                |
| - DialogTitle                                                                 |
| - Eye                                                                         |
| - FileText                                                                    |
| - ...more JSX component tags exist in file                                    |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/card -> client/src/components/ui/card                       |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/textarea -> client/src/components/ui/textarea               |
| - @/lib/api-client -> client/src/lib/api-client                               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: Yes    Success: Yes    Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: AlertCircle, ArrowLeft, Badge, BookOpen, Button, Card, CardContent, CardHeader] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/d-supervisor/settings`

Page Source: [client/src/app/d-supervisor/settings/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/d-supervisor/settings/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /d-supervisor/settings                                                 |
| FILE  : client/src/app/d-supervisor/settings/page.tsx                          |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Bell                                                                        |
| - Building                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Input                                                                       |
| - Label                                                                       |
| - Lock                                                                        |
| - Mail                                                                        |
| - Phone                                                                       |
| - Separator                                                                   |
| - User                                                                        |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/separator -> client/src/components/ui/separator             |
| - @/services/auth.service -> client/src/services/auth.service                 |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: Yes    Empty: No     Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Bell, Building, Button, Card, CardContent, CardDescription, CardHeader, CardTitle] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/d-supervisor/students/[id]`

Page Source: [client/src/app/d-supervisor/students/[id]/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/d-supervisor/students/[id]/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /d-supervisor/students/[id]                                            |
| FILE  : client/src/app/d-supervisor/students/[id]/page.tsx                     |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - ArrowLeft                                                                   |
| - Badge                                                                       |
| - BookOpen                                                                    |
| - Briefcase                                                                   |
| - Building                                                                    |
| - Button                                                                      |
| - Calendar                                                                    |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - ClipboardCheck                                                              |
| - Label                                                                       |
| - Link                                                                        |
| - LoadingCard                                                                 |
| - Mail                                                                        |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - @/components/ui/separator -> client/src/components/ui/separator             |
| - @/services/student.service -> client/src/services/student.service           |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - next/link -> next/link                                                      |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: Yes    Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: ArrowLeft, Badge, BookOpen, Briefcase, Building, Button, Calendar, Card] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/d-supervisor/students`

Page Source: [client/src/app/d-supervisor/students/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/d-supervisor/students/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /d-supervisor/students                                                 |
| FILE  : client/src/app/d-supervisor/students/page.tsx                          |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Badge                                                                       |
| - BookOpen                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - ClipboardCheck                                                              |
| - Eye                                                                         |
| - Input                                                                       |
| - Link                                                                        |
| - LoadingCard                                                                 |
| - Search                                                                      |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - @/lib/api-client -> client/src/lib/api-client                               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - next/link -> next/link                                                      |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: Yes    Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Badge, BookOpen, Button, Card, CardContent, CardDescription, CardHeader, CardTitle] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/forgot-password`

Page Source: [client/src/app/forgot-password/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/forgot-password/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /forgot-password                                                       |
| FILE  : client/src/app/forgot-password/page.tsx                                |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Input                                                                       |
| - Label                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/card -> client/src/components/ui/card                       |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/lib/api-client -> client/src/lib/api-client                               |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: Yes    Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, Card, CardContent, CardHeader, CardTitle, Input, Label] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/i-supervisor/assessments`

Page Source: [client/src/app/i-supervisor/assessments/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/i-supervisor/assessments/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /i-supervisor/assessments                                              |
| FILE  : client/src/app/i-supervisor/assessments/page.tsx                       |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Award                                                                       |
| - Badge                                                                       |
| - Button                                                                      |
| - Calendar                                                                    |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - ClipboardCheck                                                              |
| - Eye                                                                         |
| - Input                                                                       |
| - LoadingCard                                                                 |
| - Plus                                                                        |
| - Search                                                                      |
| - Select                                                                      |
| - SelectContent                                                               |
| - SelectItem                                                                  |
| - SelectTrigger                                                               |
| - SelectValue                                                                 |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Award, Badge, Button, Calendar, Card, CardContent, CardDescription, CardHeader] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/i-supervisor/attendance`

Page Source: [client/src/app/i-supervisor/attendance/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/i-supervisor/attendance/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /i-supervisor/attendance                                               |
| FILE  : client/src/app/i-supervisor/attendance/page.tsx                        |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - FileText                                                                    |
| - SupervisorApprovalInterface                                                 |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/attendance/supervisor-approval -> client/src/components/attendance/supervisor-approval|
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/services/placement.service -> client/src/services/placement.service       |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Card, CardContent, CardDescription, CardHeader, CardTitle, FileText, SupervisorApprovalInterface, Users] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/i-supervisor/dashboard`

Page Source: [client/src/app/i-supervisor/dashboard/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/i-supervisor/dashboard/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /i-supervisor/dashboard                                                |
| FILE  : client/src/app/i-supervisor/dashboard/page.tsx                         |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - BookOpen                                                                    |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - CheckCircle                                                                 |
| - Link                                                                        |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/card -> client/src/components/ui/card                       |
| - @/lib/api-client -> client/src/lib/api-client                               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: BookOpen, Button, Card, CardContent, CardHeader, CardTitle, CheckCircle, Link] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/i-supervisor/logbooks`

Page Source: [client/src/app/i-supervisor/logbooks/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/i-supervisor/logbooks/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /i-supervisor/logbooks                                                 |
| FILE  : client/src/app/i-supervisor/logbooks/page.tsx                          |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Badge                                                                       |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - ChevronLeft                                                                 |
| - Dialog                                                                      |
| - DialogContent                                                               |
| - DialogDescription                                                           |
| - DialogHeader                                                                |
| - DialogTitle                                                                 |
| - Eye                                                                         |
| - FileText                                                                    |
| - Icon                                                                        |
| - Input                                                                       |
| - Label                                                                       |
| - Logbook                                                                     |
| - MessageSquare                                                               |
| - ...more JSX component tags exist in file                                    |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/textarea -> client/src/components/ui/textarea               |
| - @/lib/api-client -> client/src/lib/api-client                               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: Yes    Success: Yes    Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ChevronLeft] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/i-supervisor/settings`

Page Source: [client/src/app/i-supervisor/settings/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/i-supervisor/settings/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /i-supervisor/settings                                                 |
| FILE  : client/src/app/i-supervisor/settings/page.tsx                          |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Bell                                                                        |
| - Briefcase                                                                   |
| - Building2                                                                   |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Input                                                                       |
| - Label                                                                       |
| - Lock                                                                        |
| - Mail                                                                        |
| - MapPin                                                                      |
| - Phone                                                                       |
| - Separator                                                                   |
| - User                                                                        |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/separator -> client/src/components/ui/separator             |
| - @/services/auth.service -> client/src/services/auth.service                 |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: Yes    Empty: No     Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Bell, Briefcase, Building2, Button, Card, CardContent, CardDescription, CardHeader] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/i-supervisor/students/[id]`

Page Source: [client/src/app/i-supervisor/students/[id]/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/i-supervisor/students/[id]/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /i-supervisor/students/[id]                                            |
| FILE  : client/src/app/i-supervisor/students/[id]/page.tsx                     |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - ArrowLeft                                                                   |
| - Badge                                                                       |
| - Briefcase                                                                   |
| - Building2                                                                   |
| - Button                                                                      |
| - Calendar                                                                    |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - ClipboardCheck                                                              |
| - Label                                                                       |
| - Link                                                                        |
| - Loading                                                                     |
| - Mail                                                                        |
| - MapPin                                                                      |
| - Phone                                                                       |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - @/services/student.service -> client/src/services/student.service           |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - next/link -> next/link                                                      |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: Yes    Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: ArrowLeft, Badge, Briefcase, Building2, Button, Calendar, Card, CardContent] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/i-supervisor/students`

Page Source: [client/src/app/i-supervisor/students/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/i-supervisor/students/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /i-supervisor/students                                                 |
| FILE  : client/src/app/i-supervisor/students/page.tsx                          |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Badge                                                                       |
| - BookOpen                                                                    |
| - Building2                                                                   |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Eye                                                                         |
| - Input                                                                       |
| - Link                                                                        |
| - LoadingCard                                                                 |
| - Search                                                                      |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/badge -> client/src/components/ui/badge                     |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - @/lib/api-client -> client/src/lib/api-client                               |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Badge, BookOpen, Building2, Button, Card, CardContent, CardDescription, CardHeader] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/invite/setup`

Page Source: [client/src/app/invite/setup/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/invite/setup/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /invite/setup                                                          |
| FILE  : client/src/app/invite/setup/page.tsx                                   |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Eye                                                                         |
| - EyeOff                                                                      |
| - Input                                                                       |
| - Label                                                                       |
| - Link                                                                        |
| - Loader2                                                                     |
| - Select                                                                      |
| - SelectContent                                                               |
| - SelectItem                                                                  |
| - SelectTrigger                                                               |
| - SelectValue                                                                 |
| - UserPlus                                                                    |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/services/invitation.service -> client/src/services/invitation.service     |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
| - next/navigation -> next/navigation                                          |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: Yes    Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Eye, EyeOff] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/invite/verify`

Page Source: [client/src/app/invite/verify/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/invite/verify/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /invite/verify                                                         |
| FILE  : client/src/app/invite/verify/page.tsx                                  |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - CheckCircle2                                                                |
| - Link                                                                        |
| - Loader2                                                                     |
| - XCircle                                                                     |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/card -> client/src/components/ui/card                       |
| - @/services/invitation.service -> client/src/services/invitation.service     |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/link -> next/link                                                      |
| - next/navigation -> next/navigation                                          |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: No     Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, Card, CardContent, CardHeader, CardTitle, CheckCircle2, Link, Loader2] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/login`

Page Source: [client/src/app/login/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/login/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /login                                                                 |
| FILE  : client/src/app/login/page.tsx                                          |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - GraduationCap                                                               |
| - Input                                                                       |
| - Label                                                                       |
| - Loader2                                                                     |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: Yes    Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, Card, CardContent, CardDescription, CardHeader, CardTitle, GraduationCap, Input] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: ``

Page Source: [client/src/app/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE :                                                                        |
| FILE  : client/src/app/page.tsx                                                |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - No JSX component tags detected                                              |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - next/navigation -> next/navigation                                          |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: No     Empty: No     Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: PageHeader, SectionCard, TableShell                         ] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/reset-password`

Page Source: [client/src/app/reset-password/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/reset-password/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /reset-password                                                        |
| FILE  : client/src/app/reset-password/page.tsx                                 |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Input                                                                       |
| - KeyRound                                                                    |
| - Label                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/services/auth.service -> client/src/services/auth.service                 |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - next/navigation -> next/navigation                                          |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: Yes    Empty: No     Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, KeyRound] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/student/attendance`

Page Source: [client/src/app/student/attendance/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/student/attendance/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /student/attendance                                                    |
| FILE  : client/src/app/student/attendance/page.tsx                             |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - AbsenceRequestForm                                                          |
| - AlertCircle                                                                 |
| - AttendanceCheckIn                                                           |
| - AttendanceHistory                                                           |
| - AttendanceSummaryCard                                                       |
| - BarChart3                                                                   |
| - Calendar                                                                    |
| - FileText                                                                    |
| - Tabs                                                                        |
| - TabsContent                                                                 |
| - TabsList                                                                    |
| - TabsTrigger                                                                 |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/attendance/absence-request-form -> client/src/components/attendance/absence-request-form|
| - @/components/attendance/attendance-check-in -> client/src/components/attendance/attendance-check-in|
| - @/components/attendance/attendance-history -> client/src/components/attendance/attendance-history|
| - @/components/attendance/attendance-summary -> client/src/components/attendance/attendance-summary|
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/tabs -> client/src/components/ui/tabs                       |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: No     Empty: No     Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: AbsenceRequestForm, AlertCircle, AttendanceCheckIn, AttendanceHistory, AttendanceSummaryCard, BarChart3, Calendar, FileText] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/student/dashboard`

Page Source: [client/src/app/student/dashboard/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/student/dashboard/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /student/dashboard                                                     |
| FILE  : client/src/app/student/dashboard/page.tsx                              |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - AlertCircle                                                                 |
| - AttendanceCheckIn                                                           |
| - BookOpen                                                                    |
| - Briefcase                                                                   |
| - Building                                                                    |
| - Button                                                                      |
| - Calendar                                                                    |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - CheckCircle                                                                 |
| - Clock                                                                       |
| - Link                                                                        |
| - XCircle                                                                     |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/attendance/attendance-check-in -> client/src/components/attendance/attendance-check-in|
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/services/logbook.service -> client/src/services/logbook.service           |
| - @/services/student.service -> client/src/services/student.service           |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - next/link -> next/link                                                      |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: No     Empty: Yes    Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: AlertCircle, AttendanceCheckIn, BookOpen, Briefcase, Building, Button, Calendar, Card] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/student/logbook`

Page Source: [client/src/app/student/logbook/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/student/logbook/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /student/logbook                                                       |
| FILE  : client/src/app/student/logbook/page.tsx                                |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - Description: Document your weekly training activities                       |
| - Document your weekly training activities                                    |
| - Logbook                                                                     |
| - Title: Logbook                                                              |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - CheckCircle                                                                 |
| - Loading                                                                     |
| - LoadingCard                                                                 |
| - LogbookAccessNotice                                                         |
| - LogbookAccordion                                                            |
| - LogbookEmptyState                                                           |
| - LogbookFormDialog                                                           |
| - PageHeader                                                                  |
| - Plus                                                                        |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/LogbookAccessNotice -> ./components/LogbookAccessNotice        |
| - ./components/LogbookAccordion -> ./components/LogbookAccordion              |
| - ./components/LogbookEmptyState -> ./components/LogbookEmptyState            |
| - ./components/LogbookFormDialog -> ./components/LogbookFormDialog            |
| - ./hooks/useStudentLogbook -> ./hooks/useStudentLogbook                      |
| - @/components/design-system/page-header -> client/src/components/design-system/page-header|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: Yes    Success: Yes    Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, CheckCircle, Loading, LoadingCard, LogbookAccessNotice, LogbookAccordion, LogbookEmptyState, LogbookFormDialog] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/student/placement`

Page Source: [client/src/app/student/placement/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/student/placement/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /student/placement                                                     |
| FILE  : client/src/app/student/placement/page.tsx                              |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - Description: Manage your industrial training placement information          |
| - Industrial Placement                                                        |
| - Manage your industrial training placement information                       |
| - Title: Industrial Placement                                                 |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - PageHeader                                                                  |
| - PlacementCompanySection                                                     |
| - PlacementEmptyState                                                         |
| - PlacementFormDialog                                                         |
| - PlacementRemarksSection                                                     |
| - PlacementStatusCard                                                         |
| - PlacementSupervisorSection                                                  |
| - PlacementTrainingSection                                                    |
| - Plus                                                                        |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - ./components/PlacementCompanySection -> ./components/PlacementCompanySection|
| - ./components/PlacementEmptyState -> ./components/PlacementEmptyState        |
| - ./components/PlacementFormDialog -> ./components/PlacementFormDialog        |
| - ./components/PlacementRemarksSection -> ./components/PlacementRemarksSection|
| - ./components/PlacementStatusCard -> ./components/PlacementStatusCard        |
| - ./components/PlacementSupervisorSection -> ./components/PlacementSupervisorSection|
| - ./components/PlacementTrainingSection -> ./components/PlacementTrainingSection|
| - ./hooks/useStudentPlacement -> ./hooks/useStudentPlacement                  |
| - @/components/design-system/page-header -> client/src/components/design-system/page-header|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
| - sonner -> sonner                                                            |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: No     Error: Yes    Empty: Yes    Success: No     Confirm: Yes               |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, PageHeader, PlacementCompanySection, PlacementEmptyState, PlacementFormDialog, PlacementRemarksSection, PlacementStatusCard, PlacementSupervisorSection] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/student/settings`

Page Source: [client/src/app/student/settings/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/student/settings/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /student/settings                                                      |
| FILE  : client/src/app/student/settings/page.tsx                               |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Button                                                                      |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Input                                                                       |
| - Label                                                                       |
| - LoadingCard                                                                 |
| - Lock                                                                        |
| - Mail                                                                        |
| - User                                                                        |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/button -> client/src/components/ui/button                   |
| - @/components/ui/input -> client/src/components/ui/input                     |
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - @/services/auth.service -> client/src/services/auth.service                 |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
| - react -> react                                                              |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: Yes    Empty: No     Success: Yes    Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

---

## Route: `/student/supervisors`

Page Source: [client/src/app/student/supervisors/page.tsx](/home/bello/Desktop/projects/IITMS/client/src/app/student/supervisors/page.tsx)

```text
+--------------------------------------------------------------------------------+
| ROUTE : /student/supervisors                                                   |
| FILE  : client/src/app/student/supervisors/page.tsx                            |
|--------------------------------------------------------------------------------|
| PAGE CONTENT TOKENS (source-derived copy cues)                                |
| - No explicit copy token in page file; use imported component labels          |
|--------------------------------------------------------------------------------|
| COMPONENT INVENTORY                                                            |
| - Briefcase                                                                   |
| - Building2                                                                   |
| - Card                                                                        |
| - CardContent                                                                 |
| - CardDescription                                                             |
| - CardHeader                                                                  |
| - CardTitle                                                                   |
| - Label                                                                       |
| - Mail                                                                        |
| - Phone                                                                       |
| - User                                                                        |
| - Users                                                                       |
|--------------------------------------------------------------------------------|
| IMPORT SOURCES FOR DETAILED BLOCK DEFINITIONS                                 |
| - @/components/providers/auth-provider -> client/src/components/providers/auth-provider|
| - @/components/ui/label -> client/src/components/ui/label                     |
| - @/components/ui/loading -> client/src/components/ui/loading                 |
| - @/services/student.service -> client/src/services/student.service           |
| - @/types/models -> client/src/types/models                                   |
| - @tanstack/react-query -> @tanstack/react-query                              |
| - lucide-react -> lucide-react                                                |
|--------------------------------------------------------------------------------|
| SCENARIO DETECTION                                                             |
| Loading: Yes    Error: No     Empty: Yes    Success: No     Confirm: No                |
|--------------------------------------------------------------------------------|
| DEFAULT FRAME                                                                  |
| [PageHeader + Actions]                                                         |
| [Primary Stack: Briefcase, Building2, Card, CardContent, CardDescription, CardHeader, CardTitle, Label] |
| [Data blocks/tables/forms/detail panels from component inventory]              |
|--------------------------------------------------------------------------------|
| LOADING FRAME                                                                  |
| [LoadingPage] or [LoadingSectionSkeleton/LoadingTableSkeleton]                 |
|--------------------------------------------------------------------------------|
| ERROR FRAME                                                                    |
| [ErrorLocalState] for block failure, [ErrorGlobalState] for fatal route error  |
|--------------------------------------------------------------------------------|
| EMPTY FRAME                                                                    |
| [EmptyState] with role-specific primary action                                |
|--------------------------------------------------------------------------------|
| SUCCESS FRAME                                                                  |
| [AlertInline success] + toast after mutations                                 |
|--------------------------------------------------------------------------------|
| CONFIRMATION FRAME                                                             |
| Confirm destructive/irreversible actions before commit                        |
+--------------------------------------------------------------------------------+
```

## Final Handoff Rule

Design handoff is complete only when every route above has all six scenario frames and uses shared reusable components from `client/src/components/design-system`.
