//-------------------------- Student Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define(
        "Student",
        {
            stud_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            stud_fname: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            stud_lname: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            stud_dob: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            stud_regno: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            stud_email: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            stud_mobile: {
                type: DataTypes.BIGINT,
                defaultValue: null,
                unique: true,
            },
            mob_otp: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            otp_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N"],
            },
            stud_image: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            stud_gender: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["MALE", "FEMALE"],
            },
            stud_pass: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            edu_qual: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            med_opt: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            country_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            state_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            city_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            parent_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            state: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            district: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            location: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            address: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            pincode: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            parent_relation: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            parent_mobile: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            stud_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            stud_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["W", "Y", "N", "D"],
            },
            ipaddress: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__student" }
    );
    return Student;
};

//-------------------------- Student Model End ------------------------------//
