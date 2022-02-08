//-------------------------- School Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const SchoolQCExam = sequelize.define(
        "SchoolQCExam",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            schoolRefId: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            masterCategory: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            mainCategory: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            subCategory: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            chapterIds: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            activeStatus: {
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
        },
        { timestamps: false, tableName: "tbl__school_questioncloud_exam" }
    );
    return SchoolQCExam;
};

//-------------------------- School Model End ------------------------------//
