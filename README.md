// todo
<!-- - Move attendance and edit attendance to the view details (make attendance only the saved not the new) -->
<!-- - Admin can view attendance details -->
<!-- - Remove points and question index -->
<!-- - Make save button instead of submit -->
- Email after rating
- Admin two report (excel for the assignments scores on a day , pdf for list of assignments results in a specific day)
- log for centers

<!-- $2b$10$UsY5bEAErH9PGymKdqDl..YGWnhN61cku9lMqRIvK6s8y.D3Hc38K   -->
<!-- Moe@#01022923659 -->
backup path =/var/backups/mysql/center-management-system/center-management-system-$(date +\%F).sql

mohamed.ellnagar@outlook.com


-- Alter the totalRating column to be FLOAT
ALTER TABLE UserAssignment
MODIFY COLUMN totalRating FLOAT;

-- Add the totalPoints column as INT
ALTER TABLE UserAssignment
ADD COLUMN totalPoints INT AFTER totalScore;

-- Ensure totalScore is INT if not already
ALTER TABLE UserAssignment
MODIFY COLUMN totalScore INT;

