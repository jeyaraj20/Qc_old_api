//-------------------------- Operator Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const { gzipSync, gunzipSync } = require("zlib");
    const SchoolOperator = sequelize.define(
        "SchoolOperator",
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
                values: ["O", "A","S","C"],
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
            schoolid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
                allowNull: false,
            },
            master_category_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            main_category_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            sub_category_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            
        },
        { timestamps: false, tableName: "tbl__school_operator" }
    );
    return SchoolOperator;
};

//-------------------------- Operator Model End ------------------------------//
