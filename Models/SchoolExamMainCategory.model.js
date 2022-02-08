//-------------------------- SchoolExamMainCategory Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const SchoolExamMainCategory = sequelize.define(
        "SchoolExamMainCategory",
        {
            exa_cat_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            exaid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            schoolid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exaid_sub: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            examcat_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["M", "C", "S"],
            },
            exa_cat_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exa_cat_slug: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exa_cat_image: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exa_cat_desc :{
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exa_cat_pos: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exa_cat_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N", "D"],
            },
            exa_cat_dt: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            exa_cat_lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
            qc_exams_id: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            qc_main_category_ids: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            qc_sub_category_ids: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            qc_chapters_ids: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
        },
        { timestamps: false, tableName: "tbl__school_exam_category" }
    );

    SchoolExamMainCategory.associate = function (models) {
        SchoolExamMainCategory.hasMany(models.ExamTypes, {
            targetKey: "exa_cat_id",
            foreignKey: "exa_cat_id",
            
        });
        SchoolExamMainCategory.hasMany(models.ExamChapters, {
            targetKey: "exa_cat_id",
            foreignKey: "exa_cat_id",
        });
        SchoolExamMainCategory.hasMany(models.Exams, {
            targetKey: "exa_cat_id",
            foreignKey: "exam_sub_sub",
        });
    };

    return SchoolExamMainCategory;
};

//-------------------------- SchoolExamMainCategory Model End ------------------------------//
