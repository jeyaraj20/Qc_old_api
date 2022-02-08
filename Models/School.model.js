//-------------------------- School Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const School = sequelize.define(
        "School",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            schoolName: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            schoolLogo: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            address1: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            address2: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            phoneNumber: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            emailId: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            password: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            contactPerson: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            mobileNumber: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            totalStudents: {
                type: DataTypes.BIGINT,
                defaultValue: null,
            },
            schoolStatus: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            ipAddress: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            createdBy: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            createdTimestamp: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            updatedBy: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            updatedTimestamp: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            expiryDate: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            
        },
        { timestamps: false, tableName: "tbl__school" }
    );

    School.associate = function (models) {
        School.hasMany(models.SchoolQCExam, {
            targetKey: "id",
            foreignKey: "schoolRefId",
        });
    };


    return School;
};

//-------------------------- School Model End ------------------------------//
