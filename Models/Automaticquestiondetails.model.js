//-------------------------- AutomaticQuestionDetails Model Start ------------------------------//

module.exports = (sequelize, DataTypes) => {
    const AutomaticQuestionDetails = sequelize.define(
        "AutomaticQuestionDetails",
        {
            automatic_quest_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            examid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            sectid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            catid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            subcatid: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            noofquestions: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            questionlevel: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            activestatus: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            createdby: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            createdtimestamp: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
            updatedby: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            updatedtimestamp: {
                type: DataTypes.DATE,
                defaultValue: null,
                allowNull: false,
            },
        },
        { timestamps: false, tableName: "tbl__automatic_question_details" }
    );
    return AutomaticQuestionDetails;
};

//-------------------------- AutomaticQuestionDetails Model End ------------------------------//
