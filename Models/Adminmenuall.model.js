//-------------------------- Adminmenu Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const Adminmenuall = sequelize.define(
        "Adminmenuall",
        {
            menu_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            menu_title: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            menu_title_apiname: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            menu_type: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            pid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            menu_link: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            menu_icon: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            menu_home: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["N", "Y"],
            },
            menu_pos: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            menu_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            menu_lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
            menu_for: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["G", "I","B"]
            },
        },
        { timestamps: false, tableName: "tbl__adminmenu_all" }
    );
    return Adminmenuall;
};

//-------------------------- Adminmenu Model End ------------------------------//
