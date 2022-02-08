//-------------------------- ExamQuestions Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const SchoolExamQuestions = sequelize.define(
        "SchoolExamQuestions",
        {
            exq_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            exam_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            schoolid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_cat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_subcat: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            sect_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            exam_code: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            quest_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["MANU", "AUTO"],
            },
            quest_assigned_type: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            quest_assigned_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            quest_assigned_name: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            qid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            cat_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            sub_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            q_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            question: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            quest_desc: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            opt_type1: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            opt_type2: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            opt_type3: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            opt_type4: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            opt_type5: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            opt_1: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            opt_2: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            opt_3: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            opt_4: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            opt_5: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            crt_ans: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            quest_level: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_queststatus: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N"],
            },
            exam_questpos:{
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            exam_questadd_date: {
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
        },
        { timestamps: false, tableName: "tbl__schoolexamquestions" }
    );
    return SchoolExamQuestions;
};

//-------------------------- ExamQuestions Model End ------------------------------//
