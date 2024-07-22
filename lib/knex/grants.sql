DROP PROCEDURE IF EXISTS mypokket.uspUpdatePokketUser;

DELIMITER $$
use mypokket $$
CREATE DEFINER=`acivilatedbadmin`@`%` procedure uspUpdatePokketUser(IN pokketUserId varchar(50),
                                                                 IN emailAddress varchar(100),
                                                                 IN namePrefix varchar(25), IN firstName varchar(75),
                                                                 IN middleName varchar(75), IN lastName varchar(75),
                                                                 IN nameSuffix varchar(25),
                                                                 IN preferredName varchar(75), IN ssn varchar(15),
                                                                 IN secondaryPhonenumber varchar(25),
                                                                 IN isNotOwnPhone tinyint(1),
                                                                 IN physicalAddressLine1 varchar(100),
                                                                 IN physicalAddressLine2 varchar(100),
                                                                 IN physicalAddressCity varchar(50),
                                                                 IN physicalAddressCounty varchar(100),
                                                                 IN physicalAddressState varchar(2),
                                                                 IN physicalAddressZip varchar(15),
                                                                 IN mailingAddressLine1 varchar(100),
                                                                 IN mailingAddressLine2 varchar(100),
                                                                 IN mailingAddressCity varchar(50),
                                                                 IN mailingAddressCounty varchar(100),
                                                                 IN mailingAddressState varchar(2),
                                                                 IN mailingAddressZip varchar(15),
                                                                 IN modifiedBy varchar(50), IN awsRequestId varchar(50))
BEGIN

    DECLARE procError varchar(1000);
    DECLARE displayError varchar(1000);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE,
    @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
SET @full_error = CONCAT("ERROR ", @errno, " (", @sqlstate, "): ", @text);
            SET procError = @full_error;
            IF @errno = 1062 then
                if  INSTR(@text, 'PRIMARY') > 0 THEN
                    set displayError = 'An account with the phone number/ssn/email address already exists.';
ELSE
                    set displayError = 'An account with the phone number/ssn/email address already exists.';
END IF;
END IF;
ROLLBACK;
select procError,displayError;
END;

START TRANSACTION;

select count(*) into @isParticipant from pokket_user_role where
    pokket_user_id=pokketUserId and user_role_id=5;

select count(*) into @isCm from pokket_user_role where
    pokket_user_id=pokketUserId and user_role_id=4;

UPDATE `pokket_user`
SET
    `email_address` = emailAddress,
    `name_prefix` = namePrefix,
    `first_name` = firstName,
    `middle_name` = middleName,
    `last_name` = lastName,
    `name_suffix` = nameSuffix,
    `preferred_name` = preferredName,
    # 	`primary_phone_number` = primaryPhoneNumber,
    `secondary_phone_number` = secondaryPhoneNumber,
    `ssn` = ssn,
    `modified_by` = modifiedBy,
    `modified_dtm` = CURRENT_TIMESTAMP,
    `aws_request_id`=awsRequestId
WHERE `pokket_user_id` = pokketUserId;

if @isCm <> 0 then
UPDATE `pokket_user`
SET
    `is_cm_using_spa_phone` = isNotOwnPhone,
    `modified_by` = modifiedBy,
    `modified_dtm` = CURRENT_TIMESTAMP,
    `aws_request_id`=awsRequestId
WHERE `pokket_user_id` = pokketUserId;
end if;

select count(*) into @physicalAddressCount from pokket_user_address
where pokket_user_id=pokketUserId and address_type_id=1;
select count(*) into @mailingAddressCount from pokket_user_address
where pokket_user_id=pokketUserId and address_type_id=2;

IF(physicalAddressLine1 IS NOT NULL) THEN
        if @physicalAddressCount = 0 then
            INSERT INTO `pokket_user_address`
            (`pokket_user_id`,
             `address_type_id`,
             `address_line_1`,
             `address_line_2`,
             `address_city`,
             `address_county`,
             `address_state`,
             `address_zip`,
             `created_by`,
             `created_dtm`,`aws_request_id`)
            VALUES
                (pokketUserId,
                 1,
                 physicalAddressLine1,
                 physicalAddressLine2,
                 physicalAddressCity,
                 physicalAddressCounty,
                 physicalAddressState,
                 physicalAddressZip,
                 modifiedBy,
                 CURRENT_TIMESTAMP,awsRequestId);
else

select address_line_1,address_line_2,address_city,address_county,address_state,address_zip into
    @physicalAddressLine1,@physicalAddressLine2,@physicalAddressCity,@physicalAddressCounty,@physicalAddressState,
    @physicalAddressZip from pokket_user_address WHERE `pokket_user_id` = pokketUserId AND `address_type_id` = 1;
if @physicalAddressLine1 <> physicalAddressLine1 or @physicalAddressLine2 <> physicalAddressLine2 or
               @physicalAddressCity <> physicalAddressCity or @physicalAddressCounty <> physicalAddressCounty or
               @physicalAddressState <> physicalAddressState or @physicalAddressZip <> physicalAddressZip then

UPDATE `pokket_user_address`
SET
    `address_line_1` = physicalAddressLine1,
    `address_line_2` = physicalAddressLine2,
    `address_city` = physicalAddressCity,
    `address_county` = physicalAddressCounty,
    `address_state` = physicalAddressState,
    `address_zip` = physicalAddressZip,
    `modified_by` = modifiedBy,
    `modified_dtm` = CURRENT_TIMESTAMP,
    `aws_request_id`=awsRequestId
WHERE `pokket_user_id` = pokketUserId AND `address_type_id` = 1;
end if;
end if;
END IF;
    IF(mailingAddressLine1 IS NOT NULL) THEN
        if @mailingAddressCount = 0 then
            INSERT INTO `pokket_user_address`
            (`pokket_user_id`,
             `address_type_id`,
             `address_line_1`,
             `address_line_2`,
             `address_city`,
             `address_county`,
             `address_state`,
             `address_zip`,
             `created_by`,
             `created_dtm`,`aws_request_id`)
            VALUES
                (pokketUserId,
                 2,
                 mailingAddressLine1,
                 mailingAddressLine2,
                 mailingAddressCity,
                 mailingAddressCounty,
                 mailingAddressState,
                 mailingAddressZip,
                 modifiedBy,
                 CURRENT_TIMESTAMP,awsRequestId);
else
select address_line_1,address_line_2,address_city,address_county,address_state,address_zip into
    @mailingAddressLine1,@mailingAddressLine2,@mailingAddressCity,@mailingAddressCounty,@mailingAddressState,
    @mailingAddressZip from pokket_user_address WHERE `pokket_user_id` = pokketUserId AND `address_type_id` = 2;
if @mailingAddressLine1 <> mailingAddressLine1 or @mailingAddressLine2 <> mailingAddressLine2 or
               @mailingAddressCity <> mailingAddressCity or @mailingAddressCounty <> mailingAddressCounty or
               @mailingAddressState <> mailingAddressState or @mailingAddressZip <> mailingAddressZip then
UPDATE `pokket_user_address`
SET
    `address_line_1` = mailingAddressLine1,
    `address_line_2` = mailingAddressLine2,
    `address_city` = mailingAddressCity,
    `address_county` = mailingAddressCounty,
    `address_state` = mailingAddressState,
    `address_zip` = mailingAddressZip,
    `modified_by` = modifiedBy,
    `modified_dtm` = CURRENT_TIMESTAMP,
    `aws_request_id`=awsRequestId
WHERE `pokket_user_id` = pokketUserId AND `address_type_id` = 2;
end if;
end if;
END IF;

COMMIT;

CALL uspGetPokketUser(pokketUserId,modifiedBy,awsRequestId);


END
$$
DELIMITER ;

grant execute on procedure uspUpdatePokketUser to 'mypokketdbuser' @'%';