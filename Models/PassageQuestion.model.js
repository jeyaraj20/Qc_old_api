//-------------------------- Questions Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const PassageQuestions = sequelize.define(
        "PassageQuestions",
        {
            passage_question_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            question_ref_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            passage_q_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            passage_question: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_quest_desc: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_opt_type1: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            passage_opt_type2: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            passage_opt_type3: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            passage_opt_type4: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            passage_opt_type5: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["T", "I"],
            },
            passage_opt_1: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_opt_2: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_opt_3: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_opt_4: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_opt_5: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_crt_ans: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_quest_add_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            passage_quest_add_by: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_quest_pos: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            passage_quest_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["W", "Y", "N", "D"],
            },
            passage_quest_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            passage_aproved_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            passage_quest_ipaddr: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            passage_lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__passage_question" }
    );
    return PassageQuestions;
};

//-------------------------- Questions Model End ------------------------------//
