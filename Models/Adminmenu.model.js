//-------------------------- Adminmenu Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const Adminmenu = sequelize.define(
        "Adminmenu",
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
        },
        { timestamps: false, tableName: "tbl__adminmenu" }
    );
    return Adminmenu;
};

//-------------------------- Adminmenu Model End ------------------------------//
