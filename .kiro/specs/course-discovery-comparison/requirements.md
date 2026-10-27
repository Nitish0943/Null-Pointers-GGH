# Requirements Document

## Introduction

This feature delivers a complete Course Discovery, Institution Discovery, and Course Comparison experience for the Mantrix mobile app. Students (school and college) can search and filter courses offered by real institutions drawn from the existing Chhattisgarh college datasets, view full course and institution details, see relevant scholarship suggestions sourced from the scholarship dataset, save courses to their personal library, and compare up to four courses side-by-side. The feature replaces the current demo-data screens with live Firestore-backed functionality while preserving the existing Mantrix UI theme, navigation, authentication, and Firestore security rules.

## Glossary

- **Course_Discovery_Screen**: The main search-and-filter screen where students browse available courses.
- **Institution_Discovery_Screen**: The dedicated screen where students browse and filter institutions, backed by the existing CollegeFinder screen pattern.
- **Course_Details_Screen**: The screen that shows full information about a single course.
- **Institution_Details_Screen**: The screen that shows full information about a single institution and its courses.
- **Course_Comparison_Screen**: The screen that renders a side-by-side comparison table for selected courses.
- **Comparison_Basket**: The in-memory (and persisted-across-navigation) collection of course IDs the student has selected for comparison; maximum 4 entries.
- **Saved_Courses**: The Firestore subcollection `user-data/{uid}/saved-courses` containing courses the authenticated student has bookmarked.
- **CourseRecord**: A document in the Firestore `courses` collection with fields: `id`, `name`, `institutionId`, `institutionName`, `degree`, `stream`, `specialization`, `location`, `city`, `state`, `duration`, `fees`, `studyMode`, `eligibility`, `admissionProcess`, `applicationDeadline`, `accreditation`, `officialUrl`, `category`, `keywords`.
- **InstitutionRecord**: A document in the Firestore `colleges` collection with fields: `id`, `name`, `city`, `state`, `type`, `management`, `affiliation`, `officialUrl`, `courseIds`.
- **ScholarshipRecord**: A document in the Firestore `scholarships` collection (seeded from the existing `scholarship_dataset.json`).
- **Comparison_Service**: The shared React context (`ComparisonContext`) that owns the Comparison_Basket state and exposes add/remove/clear operations.
- **Course_Service**: The module `courses/services/course-service.ts` that wraps all Firestore reads for courses.
- **Institution_Service**: The module `colleges/services/institution-service.ts` that wraps all Firestore reads for institutions.
- **Scholarship_Service**: The module `shared/services/scholarship-service.ts` that wraps Firestore reads for scholarships.
- **Seeder**: The Node.js script `scripts/seed-courses.ts` that ingests the existing JSON datasets into Firestore.
- **Student**: An authenticated user with role `school_student` or `college_student`.

---

## Requirements

### Requirement 1: Data Seeding and Firestore Model

**User Story:** As a developer, I want the existing Chhattisgarh college and course datasets ingested into Firestore, so that the mobile app has real, structured data to display.

#### Acceptance Criteria

1. THE Seeder SHALL read `data/chhattisgarh_50_college_course_comparison_dataset.json`, `data/chhattisgarh_college_comparison_dataset.json`, and `data/chhattisgarh_50_colleges_enrollment_template.json` to populate the `colleges` and `courses` collections, read `data/college-catalog.json` to populate the `colleges` collection, and read `data/scholarship_dataset.json` to populate the `scholarships` collection, writing documents in Firestore batches of at most 500 documents per batch.
2. WHEN a source record contains a null or missing field, THE Seeder SHALL substitute a sentinel value (`null` for strings and numbers, `[]` for arrays) rather than omitting the field, so that all documents share a uniform schema.
3. THE Seeder SHALL deduplicate records by `college_id` / `id` using a write-if-not-exists strategy, so that re-running the seeder skips any document whose ID already exists in Firestore without modifying it.
4. WHEN the Seeder finishes processing all source files, THE Seeder SHALL log the count of documents written, skipped, and failed to standard output.
5. WHEN the Seeder encounters a record where `officialUrl` is a non-empty string that does not match the pattern `^https://[^\s]+$`, THE Seeder SHALL set that field to `null` and emit a warning to standard output identifying the record ID and the rejected value.
6. THE Seeder SHALL include every field defined in the `CourseRecord` type in the Glossary in each document written to the `courses` collection.
7. THE Seeder SHALL include every field defined in the `InstitutionRecord` type in the Glossary in each document written to the `colleges` collection.
8. IF a source file listed in criterion 1 is absent or unreadable at seeder startup, THEN THE Seeder SHALL log an error message identifying the missing file, skip that file's collection writes, and continue processing the remaining source files.

---

### Requirement 2: Course Discovery — Search and Filter

**User Story:** As a student, I want to search and filter courses by multiple criteria, so that I can quickly find programs that match my interests and eligibility.

#### Acceptance Criteria

1. THE Course_Discovery_Screen SHALL display a text search input, accepting up to 200 characters, that filters CourseRecords using case-insensitive substring matching against the `name`, `institutionName`, `degree`, `stream`, `specialization`, `location`, and `keywords` fields.
2. WHEN the search input is empty and no filters are active, THE Course_Discovery_Screen SHALL display paginated results of all CourseRecords ordered alphabetically by `name` ascending.
3. THE Course_Discovery_Screen SHALL provide filter controls for: degree/course level, stream/specialization, institution, city/state, duration range, fees range, study mode, and eligibility keywords.
4. WHEN a student selects or deselects a filter value, THE Course_Discovery_Screen SHALL apply all active filters simultaneously (logical AND) and update the result list within 500 ms for data already in the local Firestore cache.
5. WHEN no CourseRecords match the active search and filter criteria, THE Course_Discovery_Screen SHALL display an empty-state message with a "Clear filters" action.
6. THE Course_Discovery_Screen SHALL support sorting the result list by: relevance (default when a search query is active), course name A–Z, institution name A–Z, fees ascending, fees descending, and duration ascending.
7. WHEN the result list exceeds 20 records, THE Course_Discovery_Screen SHALL use paginated loading (20 records per page) and display a "Load more" control at the bottom of the list.
8. WHEN the search query or any filter value changes, THE Course_Discovery_Screen SHALL update the result count label simultaneously with the updated result list.
9. WHILE the initial data fetch is in progress, THE Course_Discovery_Screen SHALL display a loading skeleton in place of the course card list.
10. IF the Firestore fetch returns an error, THEN THE Course_Discovery_Screen SHALL replace the course card list with an error message and a "Retry" action that re-executes the last query.
11. WHILE a "Load more" fetch is in progress, THE Course_Discovery_Screen SHALL display a loading indicator in place of the "Load more" control.

---

### Requirement 3: Course Cards

**User Story:** As a student, I want each course result to show key information at a glance, so that I can evaluate options without opening every detail page.

#### Acceptance Criteria

1. THE Course_Discovery_Screen SHALL render one CourseCard per matching CourseRecord, displaying: course name, institution name, degree/qualification, city, duration, fees (or "Not specified" when `fees` is null), and an eligibility summary showing the first 80 characters of the `eligibility` field followed by an ellipsis if truncated.
2. WHEN a CourseCard is rendered and the student is authenticated, THE Course_Discovery_Screen SHALL show a "Save" toggle button in an active/filled state when the course is in Saved_Courses and in an inactive/outline state when it is not.
3. WHEN a student presses the "Save" toggle on a CourseCard and is authenticated, THE Course_Discovery_Screen SHALL immediately update the toggle state optimistically and persist the change to `user-data/{uid}/saved-courses` in Firestore.
4. WHEN an unauthenticated student presses the "Save" toggle on a CourseCard, THE Course_Discovery_Screen SHALL display a sign-in prompt and SHALL NOT attempt a Firestore write.
5. IF the Firestore write for a save/unsave action fails, THEN THE Course_Discovery_Screen SHALL revert the toggle to its previous state and display an error notification visible for 3 seconds.
6. IF a course in a CourseCard is already present in the Comparison_Basket, THEN THE Course_Discovery_Screen SHALL render the "Add to Compare" control in a selected/active state.
7. WHEN a student presses "Add to Compare" on a CourseCard and the Comparison_Basket contains fewer than 4 courses, THE Comparison_Service SHALL add the course to the Comparison_Basket.
8. WHEN a student presses "Add to Compare" on a CourseCard and the Comparison_Basket already contains 4 courses, THE Course_Discovery_Screen SHALL display an inline message: "Remove a course from your comparison to add a new one."
9. WHEN a student presses "View Details" on a CourseCard, THE Course_Discovery_Screen SHALL navigate to the Course_Details_Screen for that course.

---

### Requirement 4: Course Details

**User Story:** As a student, I want to read complete details about a course, so that I can decide whether it suits my goals and eligibility.

#### Acceptance Criteria

1. THE Course_Details_Screen SHALL display all available fields of the CourseRecord: course name, institution name (as a tappable link to the Institution_Details_Screen), degree, stream/specialization, city, state, duration, fees, study mode, eligibility, admission process, application deadline, accreditation, and official URL.
2. WHEN a CourseRecord field contains a null value, THE Course_Details_Screen SHALL display "Not specified" in place of the field value rather than hiding the field label.
3. THE Course_Details_Screen SHALL display a "Related courses from this institution" section showing up to 5 other CourseRecords with the same `institutionId`; IF no such records exist, THEN THE Course_Details_Screen SHALL display a "No related courses available" notice in that section.
4. THE Course_Details_Screen SHALL display a "Similar courses at other institutions" section showing up to 5 CourseRecords with the same `degree` and `stream` from different institutions; IF no such records exist, THEN THE Course_Details_Screen SHALL display a "No similar courses found" notice in that section.
5. THE Course_Details_Screen SHALL display a "Relevant scholarships" section populated by THE Scholarship_Service by returning ScholarshipRecords where at least one term from the course's `degree`, `stream`, or `category` appears in the ScholarshipRecord's eligibility fields, showing up to 4 results; IF no matches are found, THEN THE Course_Details_Screen SHALL display a "No scholarships found for this course" notice.
6. WHEN a student taps a ScholarshipRecord in the "Relevant scholarships" section and the scholarship's `official_portal` URL is a non-null, valid HTTPS link, THE Course_Details_Screen SHALL open that URL in the device browser.
7. WHEN a student taps the official URL of the course and the URL is a valid HTTPS link, THE Course_Details_Screen SHALL open that URL in the device browser; IF the URL is null or does not match `^https://[^\s]+$`, THEN THE Course_Details_Screen SHALL display a "Link unavailable" notice instead.
8. THE Course_Details_Screen SHALL provide a "Save" toggle button whose initial state reflects whether the course is in Saved_Courses; WHEN toggled on, THE Course_Details_Screen SHALL add the course to Saved_Courses; WHEN toggled off, THE Course_Details_Screen SHALL remove the course from Saved_Courses.
9. THE Course_Details_Screen SHALL provide an "Add to Compare" button; WHEN the student presses it and the Comparison_Basket has fewer than 4 entries, THE Comparison_Service SHALL add the course and navigate the student to the Course_Comparison_Screen; IF the Comparison_Basket already contains 4 entries, THEN THE Course_Details_Screen SHALL display a notice and SHALL NOT modify the basket.
10. WHEN the student presses "Back", THE Course_Details_Screen SHALL return the student to the previous screen without clearing Comparison_Basket state.

---

### Requirement 5: Institution Discovery

**User Story:** As a student, I want to browse and search institutions, so that I can explore all courses offered by a specific college or university.

#### Acceptance Criteria

1. THE Institution_Discovery_Screen SHALL display a text search input that, after a 300 ms debounce following the last keystroke, filters InstitutionRecords using case-insensitive substring matching against the `name`, `city`, `type`, `management`, and `affiliation` fields.
2. THE Institution_Discovery_Screen SHALL provide filter controls for: city, management type (government/private), institution type (engineering, general, medical, etc.), and affiliation/university.
3. WHEN a student selects an institution card, THE Institution_Discovery_Screen SHALL navigate to the Institution_Details_Screen for that institution.
4. THE Institution_Discovery_Screen SHALL render one institution card per matching InstitutionRecord, displaying: institution name, city, management type, affiliation, and the count of CourseRecords sharing the InstitutionRecord's `institutionId`.
5. WHEN no InstitutionRecords match the active search and filter criteria, THE Institution_Discovery_Screen SHALL display an empty-state message with a "Clear filters" action.
6. WHILE the initial data fetch is in progress, THE Institution_Discovery_Screen SHALL display a loading skeleton in place of the institution card list.
7. IF the Firestore fetch returns an error, THEN THE Institution_Discovery_Screen SHALL display an error message indicating the failure with a "Retry" button.
8. WHEN a student scrolls to within 200 px of the bottom of the institution card list and more InstitutionRecords are available, THE Institution_Discovery_Screen SHALL fetch the next page of up to 20 InstitutionRecords and append them to the list.

---

### Requirement 6: Institution Details

**User Story:** As a student, I want to see all courses offered by an institution, so that I can compare options from the same college.

#### Acceptance Criteria

1. THE Institution_Details_Screen SHALL display: institution name, city, state, management type, affiliation, institution type, and official URL; WHEN any of these fields is null, THE Institution_Details_Screen SHALL display "Not specified" for that field.
2. WHILE the course list for the institution is loading, THE Institution_Details_Screen SHALL display a loading skeleton; IF the fetch fails, THEN THE Institution_Details_Screen SHALL display an error message with a "Retry" button; WHEN the fetch returns zero results, THE Institution_Details_Screen SHALL display a "No courses found for this institution" notice.
3. WHEN the course list fetch succeeds and returns at least one CourseRecord, THE Institution_Details_Screen SHALL display each CourseRecord as a CourseCard with Save and Add-to-Compare controls.
4. WHEN a student taps "View Details" on a CourseCard within the Institution_Details_Screen, THE Institution_Details_Screen SHALL navigate to the Course_Details_Screen for that course.
5. WHEN the student taps the official URL and the URL is a valid HTTPS link, THE Institution_Details_Screen SHALL open that URL in the device browser; IF the URL is null or invalid, THEN THE Institution_Details_Screen SHALL display a "Link unavailable" notice.
6. THE Institution_Details_Screen SHALL display a "Compare courses from this institution" button; WHEN the student presses it, THE Institution_Details_Screen SHALL navigate to the Course_Comparison_Screen with the institution pre-filtered in the course selector.

---

### Requirement 7: Course Comparison

**User Story:** As a student, I want to compare up to four courses side-by-side, so that I can make an informed decision about which program to pursue.

#### Acceptance Criteria

1. THE Course_Comparison_Screen SHALL display a comparison table with one column per course in the Comparison_Basket and one row per field: course name, institution name, degree/qualification, stream/specialization, city, duration, fees, eligibility, admission process, application deadline, study mode, accreditation, and official URL.
2. WHEN a cell value is null, THE Course_Comparison_Screen SHALL display "—" in that cell.
3. THE Course_Comparison_Screen SHALL allow the student to remove individual courses from the Comparison_Basket by pressing a dismiss control on each column header.
4. THE Course_Comparison_Screen SHALL display a "Clear all" button; WHEN the student presses it, THE Course_Comparison_Screen SHALL display a confirmation dialog; WHEN the student confirms, THE Comparison_Service SHALL empty the Comparison_Basket; WHEN the student cancels, THE Comparison_Basket SHALL remain unchanged.
5. WHEN the Comparison_Basket contains fewer than 2 courses, THE Course_Comparison_Screen SHALL display a prompt instructing the student to add at least one more course, with an "Add courses" button that navigates to the Course_Discovery_Screen.
6. THE Course_Comparison_Screen SHALL display an "+ Add course" slot for each empty basket position (up to 4 total); WHEN a slot is tapped, THE Course_Comparison_Screen SHALL navigate to the Course_Discovery_Screen; WHEN the student selects a course there, the selected course SHALL fill the tapped slot and the basket state SHALL be preserved.
7. WHEN a student navigates away from the Course_Comparison_Screen and returns, THE Comparison_Service SHALL preserve the Comparison_Basket such that all courseIds previously in the basket are still present.
8. THE Course_Comparison_Screen SHALL display a "Relevant scholarships" section below the table, populated by THE Scholarship_Service with ScholarshipRecords relevant to any course in the Comparison_Basket, as defined by the keyword-overlap logic in Requirement 9.
9. THE Comparison_Service SHALL prevent duplicate courseIds in the Comparison_Basket; WHEN a course already in the basket is added again, THE Comparison_Service SHALL ignore the duplicate and take no further action.
10. THE Course_Comparison_Screen SHALL support horizontal scrolling when 3 or 4 courses are being compared, such that no column is clipped or hidden from view.

---

### Requirement 8: Saved Courses

**User Story:** As a student, I want to save courses to my personal list, so that I can revisit them later without searching again.

#### Acceptance Criteria

1. WHEN an authenticated student saves a course, THE Course_Service SHALL write a document to the Firestore path `user-data/{uid}/saved-courses/{courseId}` with fields: `courseId`, `savedAt` (server timestamp), and a snapshot of `name`, `institutionName`, `degree`, and `city`.
2. WHEN an unauthenticated student attempts to save a course, THE Course_Discovery_Screen SHALL display a sign-in prompt and SHALL NOT attempt a Firestore write.
3. THE Course_Service SHALL read `user-data/{uid}/saved-courses` as a real-time listener, so that save/unsave actions made on one screen are reflected on all other open screens without requiring a manual refresh.
4. THE Saved_Courses path SHALL be governed by the existing Firestore rule `match /user-data/{uid}` with `allow read, write: if isOwner(uid)`, so that each student can access only their own saved courses.
5. WHEN a student unsaves a course, THE Course_Service SHALL delete the corresponding document from `user-data/{uid}/saved-courses/{courseId}`; IF the delete operation fails, THEN THE Course_Service SHALL emit an error event and the save toggle SHALL remain in its current state without modification.
6. THE student dashboard SHALL include a tappable entry point labelled "Saved Courses" that navigates to a screen listing all documents in `user-data/{uid}/saved-courses`.
7. WHEN the saved courses list is empty, THE SavedCoursesScreen SHALL display a "You have not saved any courses yet" notice with a link to the Course_Discovery_Screen.
8. IF the Firestore write for a save action fails, THEN THE Course_Service SHALL emit an error event and the save toggle SHALL revert to its previous state.

---

### Requirement 9: Scholarship Integration

**User Story:** As a student, I want to see scholarship suggestions relevant to courses I am viewing, so that I can understand my funding options alongside my course choices.

#### Acceptance Criteria

1. WHEN THE Scholarship_Service receives a course as input, THE Scholarship_Service SHALL query the Firestore `scholarships` collection and return ScholarshipRecords whose eligibility fields contain at least one term matching the course's `degree`, `stream`, or `category` values.
2. WHEN the `scholarships` collection is empty or the query returns zero matches, THE Scholarship_Service SHALL return an empty array without throwing an error.
3. THE Course_Details_Screen SHALL display the "Relevant scholarships" section only when THE Scholarship_Service returns at least one ScholarshipRecord; otherwise THE Course_Details_Screen SHALL display a "No scholarships found for this course" notice.
4. THE Course_Comparison_Screen SHALL display aggregated scholarship suggestions covering all courses in the Comparison_Basket, deduplicated by `scholarshipId`.
5. WHEN a student taps a scholarship entry and the scholarship's `official_portal` URL is a non-null, valid HTTPS link, THE Scholarship_Service SHALL open that URL in the device browser; IF the URL is null or invalid, THEN THE Course_Details_Screen SHALL display a "Link unavailable" notice.
6. THE Scholarship_Service SHALL cache scholarship query results in memory for the duration of the current app process to avoid repeated Firestore reads for the same query parameters.

---

### Requirement 10: Navigation and Entry Points

**User Story:** As a student, I want clear entry points from the dashboard to discovery and comparison features, so that I can reach them without needing to know where they live in the app.

#### Acceptance Criteria

1. THE student dashboard (HomeScreen) SHALL display tappable entry points for: "Discover Courses", "Explore Institutions", and "Saved Courses".
2. WHEN a student taps "Discover Courses" on the HomeScreen, THE AppNavigator SHALL navigate to the Course_Discovery_Screen.
3. WHEN a student taps "Explore Institutions" on the HomeScreen, THE AppNavigator SHALL navigate to the Institution_Discovery_Screen.
4. WHEN a student taps "Saved Courses" on the HomeScreen, THE AppNavigator SHALL navigate to a SavedCoursesScreen that lists the student's saved courses.
5. THE Course_Discovery_Screen SHALL include a persistent "Compare (N)" button in its header when N ≥ 2, where N is the current Comparison_Basket count; WHEN pressed, it SHALL navigate to the Course_Comparison_Screen.
6. WHEN the Comparison_Basket count is 0 or 1, THE Course_Discovery_Screen SHALL not display the "Compare (N)" button.
7. THE Institution_Discovery_Screen SHALL be registered in the AppNavigator as a named route `InstitutionDiscovery` with no required parameters.
8. THE SavedCoursesScreen SHALL be registered in the AppNavigator as a named route `SavedCourses` with no required parameters.
9. WHEN a student presses Back from the Course_Details_Screen, Institution_Details_Screen, or Course_Comparison_Screen, THE AppNavigator SHALL return the student to the immediately preceding screen in the navigation stack.

---

### Requirement 11: Loading, Empty, Offline, and Error States

**User Story:** As a student, I want the app to handle network issues and empty data gracefully, so that I always see a meaningful state rather than a blank or broken screen.

#### Acceptance Criteria

1. WHILE a Firestore query is pending, THE Course_Discovery_Screen, Institution_Discovery_Screen, and Course_Details_Screen SHALL each display a loading skeleton or activity indicator.
2. WHEN a Firestore query completes with zero results due to applied filters or search, THE Course_Discovery_Screen and Institution_Discovery_Screen SHALL each display an empty-state message that references the active filter or search term, and a "Clear filters" or "Search again" action.
3. IF a Firestore query fails due to a network error, THEN THE Course_Discovery_Screen SHALL display an error card with a "Retry" button that re-executes the last query.
4. IF a Firestore query fails due to a network error, THEN THE Institution_Discovery_Screen SHALL display an error message with a "Retry" button.
5. WHILE the device is offline and Firestore cached results are available, THE Course_Discovery_Screen SHALL serve results from the local cache and display an "Offline — showing cached results" banner.
6. WHILE the device is offline and no Firestore cached results are available, THE Course_Discovery_Screen SHALL display an "Offline — no cached data available" notice and SHALL NOT display any course cards.
7. WHILE the device is offline, THE Course_Discovery_Screen SHALL disable the save/unsave action and display a "Saving unavailable offline" notice when the student attempts to save a course.
8. WHEN the save or unsave Firestore write fails for any reason, THE Course_Service SHALL emit an error event that the calling screen can display as a non-blocking toast notification.

---

### Requirement 12: Security and Data Integrity

**User Story:** As a developer, I want course and institution data to be readable only by authenticated users and writable only by admins, so that the data model stays consistent and secure.

#### Acceptance Criteria

1. THE `courses` Firestore collection SHALL be governed by the existing rule: `allow read: if signedIn(); allow write: if isAdmin()`.
2. THE `colleges` Firestore collection SHALL be governed by the existing rule: `allow read: if signedIn(); allow write: if isAdmin()`.
3. THE `scholarships` Firestore collection SHALL have a security rule: `allow read: if signedIn(); allow write: if isAdmin()`.
4. THE `user-data/{uid}/saved-courses` subcollection SHALL be governed by the existing parent rule `match /user-data/{uid}` with `allow read, write: if isOwner(uid)`, so that each student can access only their own saved courses.
5. THE Course_Service SHALL never expose raw Firestore document references to the UI layer; it SHALL return typed `CourseRecord` objects only.
6. WHEN the Seeder writes documents to the `courses`, `colleges`, or `scholarships` collections, THE Seeder SHALL validate that each document's field values match the declared TypeScript types before writing; IF a record fails validation, THEN THE Seeder SHALL skip that record and log a warning identifying the record by its source identifier and the failing fields.
