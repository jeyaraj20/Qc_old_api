//-------------------------- Operator Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const { gzipSync, gunzipSync } = require("zlib");
    const SchoolStaffAssign = sequelize.define(
        "SchoolStaffAssign",
        {
            staffassign_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            school_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
                allowNull: false,
            },
            staff_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
                allowNull: false,
            },
            examcategory_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            }

        },
        { timestamps: false, tableName: "tbl__school_staffassign" }
    );
    return SchoolStaffAssign;
};

//-------------------------- Operator Model End ------------------------------//
