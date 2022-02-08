//-------------------------- Category Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const ExamPackage = sequelize.define(
        "ExamPackage",
        {
            package_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            package_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            master_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            main_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            sub_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            chapt_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            selling_price: {
                type: DataTypes.DOUBLE,
                defaultValue: null,
            },
            package_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            package_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            package_lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__exampackage" }
    );
    return ExamPackage;
};

//-------------------------- Category Model End ------------------------------//
