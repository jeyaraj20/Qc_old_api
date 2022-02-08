//-------------------------- Questions Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const SchoolQuestions = sequelize.define(
        "SchoolQuestions",
        {
            qid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            cat_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            sub_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            schoolid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            quest_add_type: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["A", "O", "S"],
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
            question_code: {
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
            opt_1: {
                type: DataTypes.STRING,
                defaultValue: null,
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
            quest_add_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            quest_add_by: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            quest_pos: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            quest_status: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["W", "Y", "N", "D"],
            },
            quest_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            aproved_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            quest_ipaddr: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            lastupdate: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__schoolquestion" }
    );
    return SchoolQuestions;
};

//-------------------------- Questions Model End ------------------------------//
