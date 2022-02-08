//-------------------------- Admin Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define(
        "Admin",
        {
            admin_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            admin_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            admin_pass: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            admin_status: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            sitename: {
                type: DataTypes.STRING,
                defaultValue: null,
                unique: true,
            },
            set_url: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            setting_fields: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            setting_operator: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N"],
            },
            setting_logo: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            setting_banner: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            type: {
                type: DataTypes.STRING,
                defaultValue: null
            },
            explanation: {
                type: DataTypes.STRING,
                defaultValue: null
            },
            lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__admin" }
    );
    return Admin;
};

//-------------------------- Admin Model End ------------------------------//
