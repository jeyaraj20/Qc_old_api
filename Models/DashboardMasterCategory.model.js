//-------------------------- HomeMasterCategory Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const DashboardMasterCategory = sequelize.define(
        "DashboardMasterCategory",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            dashboardCategoryid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            cat_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
        },
        { timestamps: false, tableName: "tbl__dashboard_master_category" }
    );

    DashboardMasterCategory.associate = function (models) {
        DashboardMasterCategory.hasMany(models.DashboardCategory, {
            targetKey: "exa_cat_id",
            foreignKey: "exa_cat_id",
        });
    };

    return DashboardMasterCategory;
};

//-------------------------- HomeMasterCategory Model End ------------------------------//
