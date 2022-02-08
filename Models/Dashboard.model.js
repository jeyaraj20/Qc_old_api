//-------------------------- DashboardCategory Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const DashboardCategory = sequelize.define(
        "DashboardCategory",
        {
            cat_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            master_ids:{
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            cat_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            cat_slug: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            cat_image: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            cat_pos: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            cat_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            cat_dt: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            cat_lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__dashboard_category" }
    );
    return DashboardCategory;
};

//-------------------------- DashboardCategory Model End ------------------------------//
