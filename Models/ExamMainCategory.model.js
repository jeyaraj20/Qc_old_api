//-------------------------- ExamMainCategory Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const ExamMainCategory = sequelize.define(
        "ExamMainCategory",
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
            exa_cat_desc: {
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
            payment_flag: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N"],
            },
            isAttachment: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N"],
            },
            attachmentUrl: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            attachmentFileName: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            isPopular : {
                type : DataTypes.BOOLEAN,
                defaultValue: false
            },
            isTrending : {
                type : DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        { timestamps: false, tableName: "tbl__exam_category" }
    );

    ExamMainCategory.associate = function (models) {
        ExamMainCategory.hasMany(models.ExamTypes, {
            targetKey: "exa_cat_id",
            foreignKey: "exa_cat_id",
        });
        ExamMainCategory.hasMany(models.ExamChapters, {
            targetKey: "exa_cat_id",
            foreignKey: "exa_cat_id",
        });
        ExamMainCategory.hasMany(models.Exams, {
            targetKey: "exa_cat_id",
            foreignKey: "exam_sub_sub",
        });
        ExamMainCategory.hasOne(models.ExamRatings, {
            targetKey: "exa_cat_id",
            foreignKey: "exa_cat_id",
        });
    };

    return ExamMainCategory;
};

//-------------------------- ExamMainCategory Model End ------------------------------//
