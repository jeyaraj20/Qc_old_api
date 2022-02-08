//-------------------------- Operator Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const { gzipSync, gunzipSync } = require("zlib");
    const Operator = sequelize.define(
        "Operator",
        {
            op_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            op_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            op_uname: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            op_password: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            op_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["O", "A"],
            },
            feat_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            op_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            op_dt: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            op_lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__operator" }
    );
    return Operator;
};

//-------------------------- Operator Model End ------------------------------//
