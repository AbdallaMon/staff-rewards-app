// todo
// dates filters
// pagination in user attendance only day date

// center students attendaded
- for admin number of students * 35
diff between what income and output (filter by date and center)

- show pending accounts
- what paid and rest and total for staff
<!-- $2b$10$UsY5bEAErH9PGymKdqDl..YGWnhN61cku9lMqRIvK6s8y.D3Hc38K   -->
<!-- Moe@#01022923659 -->
backup path =/var/backups/mysql/center-management-system/center-management-system-$(date +\%F).sql

mohamed.ellnagar@outlook.com


// query in the db later

apikey =fa5889e970df3fe848fe54c7c2ad22ef9af97d106d6bc54fb708c1181509e31f


CREATE TABLE `StudentAttendance` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `centerId` INT NOT NULL,
  `date` DATETIME NOT NULL,
  `examType` ENUM('TEACHER', 'GRADUATE') NOT NULL,
  `totalAttendedStudents` INT NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `center_examType_date_unique` (`centerId`, `examType`, `date`),
  CONSTRAINT `fk_studentAttendance_center` FOREIGN KEY (`centerId`) REFERENCES `center` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
