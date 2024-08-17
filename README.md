// todo
<!-- - can make attendance for المراقب in another center -->
<!-- - admin can add other duties -->
<!-- - center attendance for more than duty(check shifts must be one) two records -->
<!-- - total shift (remove) -> dashboard -->
<!-- - exams (old and new )-> dashboard -->
<!-- - remove overall summary -->
<!-- - users status chart -->
<!-- - uncompleted tab -->
<!-- - admin edit users profile( no attachments) -->
<!-- - admin can edit attendance -->
<!-- - can delete dayAttendance -->

----- financial
- staff
<!-- - reminder to all non uploaded attachments -->
<!-- - edit and reminder if no signature -->
<!-- - download all attachment links -->

---- center
<!-- - view attendance attachment(uploaded or not) -->
- profile
<!-- - center in report -->
<!-- - search all users -->

- paint signature

<!-- -- add filter by duty -->


<!-- $2b$10$UsY5bEAErH9PGymKdqDl..YGWnhN61cku9lMqRIvK6s8y.D3Hc38K   -->
<!-- Moe@#01022923659 -->
backup path =/var/backups/mysql/center-management-system/center-management-system-$(date +\%F).sql

mohamed.ellnagar@outlook.com


// query in the db later

CREATE TABLE UserAdditionalDuties (
    userId INT NOT NULL,
    dutyId INT NOT NULL,
    PRIMARY KEY (userId, dutyId),
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (dutyId) REFERENCES Duty(id) ON DELETE CASCADE
);



ALTER TABLE `dayattendance`

ALTER TABLE `dayattendance` DROP FOREIGN KEY `DayAttendance_centerId_fkey`;
ALTER TABLE `dayattendance` DROP FOREIGN KEY `DayAttendance_userId_fkey`;
ALTER TABLE `dayattendance` DROP INDEX `DayAttendance_userId_date_centerId_key`;

ALTER TABLE `Attendance`
ADD CONSTRAINT `Attendance_userId_shiftId_date_centerId_unique`
UNIQUE (`userId`, `shiftId`, `date`);
