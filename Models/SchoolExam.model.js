//-------------------------- SchoolExams Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const  SchoolExams = sequelize.define(
        "SchoolExams",
        {
            exam_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            schoolid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_sub: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_sub_sub: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exam_slug: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            assign_test_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["D", "M"],
            },
            exam_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["C", "B"],
            },
            exam_code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            exam_level: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            sect_cutoff: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["N", "Y"],
            },
            sect_timing: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["N", "Y"],
            },
            tot_questions: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            tot_mark: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            mark_perquest: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            neg_markquest: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            total_time: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            quest_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["MANU", "AUTO"],
            },
            exam_type_cat: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "C", "P"],
            },
            exam_type_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_pos: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["W", "Y", "N", "D"],
            },
            exam_add_type: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exam_add_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_add_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exam_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            ip_addr: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            last_update: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
            payment_flag: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["N", "Y"],
            },
            selling_price: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            offer_price: {
                type: DataTypes.DECIMAL,
                defaultValue: null,
            },
            startDate: {
                type: DataTypes.DATE,
                defaultValue: null
            },
            endDate: {
                type: DataTypes.DATE,
                defaultValue: null
            },
        },
        { timestamps: false, tableName: "tbl__schoolexam" }
    );

    SchoolExams.associate = function (models) {
        SchoolExams.hasMany(models.SchoolExamSectionDetails, {
            targetKey: "exam_id",
            foreignKey: "exam_id",
        });
    };
    return SchoolExams;
};