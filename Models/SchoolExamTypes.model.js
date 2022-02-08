module.exports = (sequelize, DataTypes) => {
    const SchoolExamTypes  = sequelize.define(
        "SchoolExamTypes",
        {
            extype_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            exa_cat_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            schoolid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exmain_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exsub_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            extest_type: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            extype_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            extype_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__schoolexamtypes" }
    );
    return SchoolExamTypes;
};