//-------------------------- Notes Model Start ------------------------------//
module.exports = (sequelize, DataTypes) => {
    const Notes = sequelize.define(
        "Videos",
        {
            videosId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            chapterId: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            videosName: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            videosDescription: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            videosUrl: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            videosPosition: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            createdBy : {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
            videosStatus: {
                type: DataTypes.ENUM,
                defaultValue: null,
                values: ["Y", "N"],
            },
            thumbnailUrl : {
                type: DataTypes.STRING,
                defaultValue: null,
            }
        },
        { timestamps: true, tableName: "tbl__videos" }
    );
    return Notes;
};

//-------------------------- Category Model End ------------------------------//
