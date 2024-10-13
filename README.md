// todo
<!-- - Move attendance and edit attendance to the view details (make attendance only the saved not the new) -->
<!-- - Admin can view attendance details -->
<!-- - Remove points and question index -->
<!-- - Make save button instead of submit -->
<!-- - Email after rating -->
<!-- - Staff can see their total rating in dashboard and (assignments answers and comment) -->
- important : change the view of assignments to make us just get the old not new
- Admin two report (excel for the assignments scores on a day , pdf for list of assignments results in a specific day)
- log for centers

<!-- $2b$10$UsY5bEAErH9PGymKdqDl..YGWnhN61cku9lMqRIvK6s8y.D3Hc38K   -->
<!-- Moe@#01022923659 -->
backup path =/var/backups/mysql/center-management-system/center-management-system-$(date +\%F).sql

mohamed.ellnagar@outlook.com




CREATE TABLE `PageAvailability` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `page` ENUM('REGISTER') NOT NULL,
  `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  `createdAt` DATETIME NOT NULL DEFAULT NOW(),
  `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW()
);

