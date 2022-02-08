//-------------------------- HomeMasterCategory Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const HomeMasterCategory = sequelize.define(
        "HomeMasterCategory",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            homecategoryid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exa_cat_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
        },
        { timestamps: false, tableName: "tbl__home_master_category" }
    );

    HomeMasterCategory.associate = function (models) {
        HomeMasterCategory.hasMany(models.HomeCategory, {
            targetKey: "exa_cat_id",
            foreignKey: "exa_cat_id",
        });
    };

    return HomeMasterCategory;
};

//-------------------------- HomeMasterCategory Model End ------------------------------//
