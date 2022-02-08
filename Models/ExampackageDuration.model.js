//-------------------------- Category Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const ExamPackageDuration = sequelize.define(
        "ExamPackageDuration",
        {
            package_duration_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            exam_package_ref_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            duration_ref_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            price: {
                type: DataTypes.DOUBLE,
                defaultValue: null,
            },
        },
        { timestamps: false, tableName: "tbl__exampackage_duration" }
    );
    return ExamPackageDuration;
};

//-------------------------- Category Model End ------------------------------//
