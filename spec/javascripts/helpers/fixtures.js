beforeEach(function() {
    window.fixtures = {};

    $.extend(window.fixtures, {
        currentId: 1,
        nextId: function() {
            return this.currentId++;
        },

        notifications: {
            "BE_MEMBER": function(overrides) {
                return new chorus.models.Notification(_.extend({
                    author: fixtures.authorJson(),
                    id: "10000",
                    timestamp: "2012-02-28 11:51:42.14",
                    type: "BE_MEMBER",
                    workspace: rspecFixtures.workspaceJson()
                }, overrides));
            }
        },

        activities: {
            "SUB_COMMENT": function(overrides) {
                var attrs = _.extend({
                    attachments: [],
                    author: fixtures.authorJson(),
                    id: "10109",
                    isDeleted: false,
                    isInsight: false,
                    text: "This is a comment on a comment",
                    timestamp: "2012-04-02 14:24:23",
                    type: "SUB_COMMENT"
                }, overrides);
                return new chorus.models.Activity(attrs);
            },

            "NOTE_ON_CHORUS_VIEW": function(overrides) {
                var instanceId = fixtures.nextId().toString();
                var attrs = _.extend({
                    author: fixtures.authorJson(),
                    type: "NOTE",
                    text: "How about that view.",
                    timestamp: "2011-12-01 00:00:00",
                    id: fixtures.nextId().toString(),
                    comments: [
                        {
                            text: "sub-comment 1",
                            author: fixtures.authorJson(),
                            timestamp: "2011-12-15 12:34:56"
                        }
                    ],
                    chorusView: {
                        id: '"' + instanceId + '"|"dca_demo"|"public"|"__a_table_name"',
                        name: '__a_chorus_view_name',
                        objectName: "__a_chorus_view_name",
                        objectType: "QUERY",
                        type: "CHORUS_VIEW"
                    },
                    attachments: [
                        {
                            entityId: "10101",
                            entityType: "file",
                            id: "10101",
                            name: "something.sql",
                            type: "SQL"
                        },
                        {
                            entityId: "10102",
                            entityType: "file",
                            id: "10102",
                            name: "something.txt",
                            type: "TXT"
                        }
                    ],
                    workspace: fixtures.nestedWorkspaceJson()
                }, overrides);
                return new chorus.models.Activity(attrs);
            },

            "COMMENT_ON_NOTE_ON_DATABASE_TABLE": function(overrides) {
                var instanceId = fixtures.nextId().toString();
                var attrs = _.extend({
                    author: fixtures.authorJson(),
                    type: "NOTE_COMMENT",
                    text: "How about that note on that table.",
                    timestamp: "2011-12-01 00:00:00",
                    id: fixtures.nextId().toString()
                }, overrides);
                return new chorus.models.Activity(attrs);
            },

            "INSIGHT_CREATED": function(overrides) {
                return new chorus.models.Activity(
                    _.extend(rspecFixtures.activity.noteOnDatasetCreatedJson().response, {
                        type: "INSIGHT_CREATED",
                        isInsight: true,
                        promotionActioner: {id: 10010, lastName: "1", firstName: "u"},
                        promotionTime: "2012-02-14 12:34:56"
                    }, overrides));
            }
        },

        artifactJson: function() {
            var id = fixtures.nextId().toString();
            return {
                entityId: fixtures.nextId().toString(),
                entityType: "file",
                id: id,
                name: "something" + id + ".sql",
                type: "SQL"
            }
        },

        authorJson: function() {
            return {
                image: { original: "/foo", icon: "/bar" },
                id: "1234",
                lastName: "Smith",
                firstName: "Bob"
            }
        },

        commentJson: function(overrides) {
            return _.extend({
                text: "sub-comment 1",
                author: fixtures.authorJson(),
                timestamp: "2011-12-15 12:34:56"
            }, overrides);
        },

        configJson: function(overrides) {
            return _.extend({
                provisionMaxSizeInGB: 2000,
                logLevel: "INFO",
                provisionMaxSize: "2000 GB",
                sandboxRecommendSizeInBytes: 5368709120,
                sandboxRecommendSize: "5 GB"
            }, overrides);
        },

        nestedWorkfileJson: function() {
            var id = this.nextId().toString();
            return {
                canEdit: true,
                id: id,
                name: "file" + id + ".sql",
                mimeType: 'text/something',
                type: 'SQL'
            }
        },

        nestedWorkspaceJson: function() {
            var id = this.nextId().toString();
            return {
                id: id,
                name: "workspace" + id
            };
        },

        versionInfoJson: function(overrides, modifiedByUser) {
            var id = this.nextId().toString();
            return _.extend({
                versionNum: 1,
                lastUpdatedStamp: "2011-11-29 10:46:03.255",
                versionFileId: this.nextId().toString(),
                content: "Workfile Content!" + id,
                modifier: {
                    firstName : modifiedByUser.firstName,
                    lastName : modifiedByUser.lastName,
                    id : modifiedByUser.id
                },
                owner: { username: "edcadmin" },
                "versionFilePath": "/Users/pivotal/workspace/chorus/ofbiz/runtime/data/workfile/10003/1332867012541_2971",
                commitMessage: null,
                isEditable: true
            }, overrides);
        },

        executionInfoJson: function(overrides) {
            return _.extend({
                databaseId: null,
                databaseName: null,
                instanceId: null,
                instanceName: null,
                schemaId: null,
                schemaName: null
            }, overrides);
        },

        comment: function(overrides) {
            var id = this.nextId().toString();
            var attributes = _.extend({
                id: id,
                text: "this is comment text" + id,
                attachments: [],
                timestamp: '2011-01-01 12:00:00'
            }, overrides);
            // WTF: old fixtures reference new fixtures ???
            attributes.author = _.extend(rspecFixtures.user().attributes, overrides && overrides.author);
            return new chorus.models.Comment(attributes);
        },

        noteComment: function(overrides) {
            commentOverrides = _.extend({
                comments: [],
                attachments: [],
                entityType: 'instance',
                entityId: this.nextId().toString(),
                type: "NOTE",
                workspace: rspecFixtures.workspace()
            }, overrides)
            return fixtures.comment(commentOverrides);
        },

        databaseColumn: function(overrides) {
            var id = this.nextId().toString();
            var attributes = _.extend({
                name: "column_name_" + id,
                typeCategory: "WHOLE_NUMBER",
                ordinalPosition: this.nextId()
            }, overrides);
            return new chorus.models.DatabaseColumn(attributes);
        },

        databaseColumnSet: function(models, overrides) {
            var id = this.nextId().toString()
            models = (models && (models.length > 0)) ? models : [this.databaseColumn(overrides), this.databaseColumn(overrides)];
            var attributes = _.extend({
                tableName: "Table" + id
            }, overrides);
            var collection = new chorus.collections.DatabaseColumnSet([], attributes);
            collection.reset(models)
            return collection;
        },

        attachment: function(overrides) {
            var attributes = _.extend({
                id: this.nextId().toString(),
                entityType: "file"
            }, overrides);
            return new chorus.models.Attachment(attributes);
        },

        datasetJson: function(overrides) {
            var id = fixtures.nextId();
            return _.extend({
                objectName: "Dataset" + id,
                schema: {
                    id: fixtures.nextId(),
                    name: "some_schema",
                    database: {
                        id: fixtures.nextId(),
                        name: "dca_demo",
                        instance: {
                            id: fixtures.nextId(),
                            name: "some_instance"
                        }
                    }
                },
                recentComment: rspecFixtures.activity.noteOnDatasetCreatedJson().response,
                commentCount: 1
            }, overrides);
        },

        datasetCommonJson: function(overrides) {
            var id = fixtures.nextId();
            var attributes = _.extend(this.datasetJson(), {
                isDeleted: false,
                importInfo: {},
                hasCredentials: true,
                importFrequency: null,
                owner: {id: "InitialUser", username: "edcadmin"},
                modifiedBy: {id: "InitialUser", username: "edcadmin"},
                workspace: {id: fixtures.nextId(), name: "some_workspace"},
                associatedWorkspaces: [rspecFixtures.workspaceJson()]
            }, overrides);
            attributes.instance = attributes.instance || {};
            attributes.instance.id = attributes.schema.database.instance.id;
            attributes.id = _.map([
                attributes.schema.database.instance.id,
                attributes.schema.database.name,
                attributes.schema.name,
                attributes.objectType,
                attributes.objectName
            ],
                function(piece) {return '"' + piece + '"'}).join("|");
            return attributes;
        },

        chorusView: function(overrides) {
            var attributes = _.extend(fixtures.datasetCommonJson(overrides), {
            }, overrides);
            return new chorus.models.ChorusView(attributes);
        },

        importSchedule: function(overrides) {
            var in1year = new Date();
            in1year.setFullYear(in1year.getFullYear() + 1);
            var in1yearStr = Date.formatForApi(in1year);

            var attributes = _.extend({
                destinationTable: '"10000"|"Analytics"|"analytics"|"TABLE"|"asdfsfsdf"',
                id: this.nextId().toString(),
                nextImportTime: in1yearStr,
                sampleCount: 500,
                sampleMethod: "RANDOM_COUNT",
                executionInfo: {
                    startedStamp: "2012-02-29T14:23:58Z",
                    completedStamp: "2012-02-29T14:23:59Z",
                    state: "success",
                    toTable: 'someTable',
                    creator: "InitialUser"
                },
                scheduleInfo: {
                    id: 1234,
                    endDate: "2013-06-02",
                    frequency: "WEEKLY",
                    toTable: 'someTable',
                    startDatetime: "2012-02-29T14:23:58Z",
                    truncate: false,
                    nextImportAt: "2013-09-07T06:00:00Z"
                },
                sourceId: '"10000"|"dca_demo"|"ddemo"|"TABLE"|"_uspresident"',
                sourceTable: null,
                sourceType: "dataset",
                toTable: "asdfsfsdf",
                truncate: false,
                workspaceId: this.nextId().toString()
            }, overrides);
            return new chorus.models.DatasetImport(attributes);
        },

        datasetHadoopExternalTable: function(overrides) {
            var attributes = _.extend(fixtures.datasetCommonJson(overrides), {
                modifiedBy: {},
                objectType: "HDFS_EXTERNAL_TABLE",
                owner: {},
                type: "SANDBOX_TABLE"
            }, overrides);
            return new chorus.models.WorkspaceDataset(attributes);
        },

        dataset: function(overrides) {
            return new chorus.models.Dataset(this.datasetJson(_.extend({
                objectType: "TABLE",
                type: "SANDBOX_TABLE"
            }, overrides)));
        },

        notificationJson: function(overrides) {
            var id = fixtures.nextId();
            return _.extend({
                id: id,
                content: "what an alert!",
                operatorFullName: "Joe Bloggs",
                operator: "joebloggs",
                recipientFullName: "Nancy Schmeigel",
                recipient: "nancy",
                isDeleted: false
            }, overrides);
        },

        notification: function(overrides) {
            return new chorus.models.Notification(this.notificationJson(overrides));
        },

        notificationSet: function(models, overrides) {
            models = models || [this.notification(overrides), this.notification(overrides)];
            return new chorus.collections.NotificationSet(models, overrides);
        },

        hdfsEntrySet: function(models, overrides) {
            models = models || [
                fixtures.hdfsEntryDirJson(),
                fixtures.hdfsEntryFileJson(),
                fixtures.hdfsEntryBinaryFileJson(),
                fixtures.hdfsEntryUnknownIfBinaryFileJson()
            ];
            var attributes = _.extend({
                path: '/data',
                hadoopInstance: {
                    id: this.nextId().toString(),
                    name: 'instanceName'
                }
            }, overrides);
            var result = new chorus.collections.HdfsEntrySet(null, attributes);
            result.reset(models);
            return result;
        },

        csvHdfsFileSet: function(models, overrides) {
            models = models || [
                fixtures.hdfsEntryDirJson(),
                fixtures.hdfsEntryFileJson(),
                fixtures.hdfsEntryBinaryFileJson(),
                fixtures.hdfsEntryUnknownIfBinaryFileJson()
            ];
            var attributes = _.extend({
                path: '/data',
                hadoopInstance: {
                    id: this.nextId().toString(),
                    name: 'hadoopInstanceName'
                }
            }, overrides);
            var result = new chorus.collections.CsvHdfsFileSet(null, attributes);
            result.reset(models);
            return result;
        },

        hdfsEntryDir: function(overrides) {
            return new chorus.models.HdfsEntry(this.hdfsEntryDirJson(overrides));
        },

        hdfsEntryDirJson: function(overrides) {
            var id = fixtures.nextId();
            return _.extend({
                "id": id,
                "name": "folder" + id,
                "isDir": true,
                "lastUpdatedStamp": "2012-02-24T10:28:42Z",
                "size": 0,
                "count": 6,
                "owner": "hadoop",
                "group": "supergroup",
                "permission": "rwxr-xr-x",
                "ancestors": [{name: "foo", id: 1}]
            }, overrides);
        },

        hdfsEntryFile: function(overrides) {
            return new chorus.models.HdfsEntry(this.hdfsEntryFileJson(overrides));
        },

        hdfsEntryFileJson: function(overrides) {
            var id = fixtures.nextId();
            return _.extend({
                "id": id,
                "name": "file" + id + ".sql",
                "isDir": false,
                "isBinary": false,
                "lastUpdatedStamp": "2012-02-24T10:28:42Z",
                "size": 23,
                "count": 0,
                "owner": "hadoop",
                "group": "supergroup",
                "permission": "rw-r--r--",
                "contents": "Contents!",
                "path": "/foo/bar",
                "hadoopInstance": {"id": fixtures.nextId()}
            }, overrides);
        },

        hdfsEntryBinaryFileJson: function(overrides) {
            var id = fixtures.nextId();
            return _.extend({
                "id": id,
                "name": "file" + id + ".bin",
                "isDir": false,
                "isBinary": true,
                "lastUpdatedStamp": "2012-02-24T10:28:42Z",
                "size": 1337,
                "count": 0,
                "owner": "hadoop",
                "group": "supergroup",
                "permission": "rw-r--r--"
            }, overrides);
        },

        hdfsEntryUnknownIfBinaryFileJson: function(overrides) {
            var id = fixtures.nextId();
            return _.extend({
                "id": id,
                "name": "file" + id + ".???",
                "isDir": false,
                "isBinary": null,
                "lastUpdatedStamp": "2012-02-24T10:28:42Z",
                "size": 1337,
                "count": 0,
                "owner": "hadoop",
                "group": "supergroup",
                "permission": "rw-r--r--"
            }, overrides);
        },

        hdfsFile: function(overrides) {
            var json = fixtures.hdfsFileJson(overrides);
            return new chorus.models.HdfsEntry(json);
        },

        hdfsFileJson: function(overrides) {
            return _.extend({
                id: fixtures.nextId(),
                name: "fixtureFile.sql",
                hadoopInstance: {id: fixtures.nextId()},
                contents: "Contents",
                ancestors: [],
                lastUpdatedStamp: "2012-03-05T15:23:44Z",
                lines: [
                    "some content;",
                    "second line"
                ],
                path: "%2Fdata%2FfixtureFile.sql"
            }, overrides)
        },

        attachmentOnWorkfileInWorkspaceSearchResult: function(overrides) {
            var attributes = _.extend({
                "entityType": "attachment",
                "type": "attachment",
                "id": "10011",
                "isDeleted": false,
                "lastUpdatedStamp": "2012-03-20 15:08:16",
                "fileId": "10011",
                "fileType": "IMAGE",
                "isBinary": true,
                "name": "Titanic2.jpg",
                "highlightedAttributes": {
                    "name": ["<em>Titanic<\/em><em>2<\/em>.jpg"]
                },
                "owner": {
                    "id": "InitialUser",
                    "lastName": "Admin",
                    "firstName": "EDC"
                },
                "workspace": {
                    "id": "10000",
                    "name": "ws"
                },
                "workfile": {
                    "id": "10030",
                    "lastUpdatedStamp": "2012-03-14 17:15:21",
                    "fileType": "TXT",
                    "versionInfo": {
                        "lastUpdatedStamp": "2012-03-14T17:15:21Z",
                        "versionFileId": "1331770521971_1380",
                        "modifier": {
                            "id": "InitialUser",
                            "lastName": "Admin",
                            "firstName": "EDC"
                        },
                        "versionFilePath": "/Users/pivotal/workspace/chorus/ofbiz/runtime/data/workfile/10003/1332867012541_2971",
                        "versionOwner": "edcadmin",
                        "versionNum": 1
                    },
                    "latestVersionNum": 1,
                    "workspace": {
                        "id": "10000",
                        "name": "ws"
                    },
                    "fileName": "buildout.txt",
                    "owner": {
                        "id": "InitialUser",
                        "lastName": "Admin",
                        "firstName": "EDC"
                    },
                    "isDeleted": false,
                    "entityType": "workfile",
                    "mimeType": "text/plain"
                },
                "comments": []
            });
            return new chorus.models.Attachment(attributes);
        },

        attachmentOnFileInHdfsSearchResult: function(overrides) {
            var attributes = _.extend(
                {
                    "entityType": "attachment",
                    "type": "attachment",
                    "id": "10012",
                    "isDeleted": false,
                    "lastUpdatedStamp": "2012-03-20 15:46:12",
                    "fileId": "10012",
                    "fileType": "IMAGE",
                    "isBinary": true,
                    "name": "pivotal (1).jpg",
                    "highlightedAttributes": {
                        "name": ["<em>pivotal<\/em> (1).jpg"]
                    },
                    "owner": {
                        "id": "InitialUser",
                        "lastName": "Admin",
                        "firstName": "EDC"
                    },
                    "workspace": {},
                    "hdfs": {
                        "id": "333",
                        "path": "/data/cleardb.sql",
                        "name": "cleardb.sql",
                        "hadoopInstance": {
                            "id": "10020",
                            "name": "hadoooooooooop"
                        },
                        "entityType": "hdfs"
                    },
                    "comments": []
                }
            );
            return new chorus.models.Attachment(attributes);
        },

        attachmentOnDatasetInWorkspaceSearchResult: function(overrides) {
            var model = this.attachmentOnDatasetNotInWorkspaceSearchResult(overrides);
            model.set({workspace: {
                id: "33333",
                name: "ws"
            }});
            model.get('dataset').workspaces = [
                {
                    id: "15555",
                    datasetType: "SANDBOX_TABLE",
                    name: "wswsws"
                },
                {
                    id: "10030",
                    datasetType: "SANDBOX_TABLE",
                    name: "has_sandbox"
                }
            ];
            return model;
        },

        attachmentOnDatasetNotInWorkspaceSearchResult: function(overrides) {
            var attributes = _.extend({
                entityType: "attachment",
                id: "10005",
                isDeleted: false,
                lastUpdatedStamp: "2012-03-16 17:06:08",
                fileId: "10005",
                fileType: "IMAGE",
                isBinary: true,
                name: "Titanic2.jpg",
                highlightedAttributes: {
                    name: ["<em>Titanic</em><em>2</em>.jpg"]
                },
                owner: {
                    id: "InitialUser",
                    lastName: "Admin",
                    firstName: "EDC"
                },
                workspace: {
                },
                dataset: {
                    id: '100',
                    schema: {
                        name: "ddemo",
                        database: {
                            name: "dca_demo",
                            instance: {
                                id: "22222",
                                name: "gillette"
                            }
                        }
                    },
                    objectName: "2010_report_on_white_house",
                    workspaces: [],
                    entityType: "dataset",
                    objectType: "TABLE"
                },
                comments: []
            });
            return new chorus.models.Attachment(attributes);
        },

        searchResultJson: function(overrides) {
            // WTF: old fixtures reference new fixtures ???
            var modifiedByUser = rspecFixtures.userJson();
            return _.extend({
                "workfiles": {
                    "results": [
                        {
                            "id": "10020",
                            "isDeleted": false,
                            "lastUpdate": "Tue Feb 21 10:53:48 PST 2012",
                            "fileType": "SQL",
                            "fileName": "test.sql",
                            "entityType": "workfile",
                            "versionInfo": this.versionInfoJson(overrides && overrides.versionInfo, modifiedByUser),
                            "owner": {
                                "id": "InitialUser",
                                "lastName": "Admin",
                                "firstName": "EDC"
                            },
                            "workspace": {
                                "id": "10050",
                                "name": "Lenny & Corina"
                            },
                            "comments": [],
                            highlightedAttributes: {
                                "fileName": ["<em>test<\/em>.sql"]
                            }
                        },
                        {
                            "id": "10040",
                            "isDeleted": false,
                            "lastUpdate": "Thu Feb 23 12:28:56 PST 2012",
                            "fileType": "SQL",
                            "fileName": "test.sql",
                            "entityType": "workfile",
                            "versionInfo": this.versionInfoJson(overrides && overrides.versionInfo, modifiedByUser),
                            "owner": {
                                "id": "InitialUser",
                                "lastName": "Admin",
                                "firstName": "EDC"
                            },
                            "workspace": {
                                "id": "10039",
                                "name": "mine"
                            },
                            "comments": [],
                            highlightedAttributes: {
                                "fileName": ["<em>test<\/em>.sql"]
                            }
                        }
                    ],
                    "numFound": 2
                },
                "workspaces": {
                    "results": [
                        {
                            comments: [],
                            entityType: "workspace",
                            id: "10000",
                            isDeleted: false,
                            public: false,
                            lastUpdatedStamp: "2012-02-24 16:08:32",
                            name: "ws",
                            owner: {
                                firstName: "EDC",
                                id: "InitialUser",
                                lastName: "Admin"
                            },
                            highlightedAttributes: {
                                name: ["<em>ws</em>"]
                            }
                        },
                        {
                            comments: [],
                            entityType: "workspace",
                            id: "10001",
                            isDeleted: false,
                            public: false,
                            lastUpdatedStamp: "2012-02-24 16:08:32",
                            name: "other_ws",
                            owner: {
                                firstName: "EDC",
                                id: "InitialUser",
                                lastName: "Admin"
                            },
                            highlightedAttributes: {
                                name: ["other_<em>ws</em>"]
                            }
                        }
                    ],
                    "numFound": 3
                },
                "datasets": {
                    "results": [
                        {
                            schemaName: "public",
                            parentType: "gpdb_10000_data_types",
                            objectType: "TABLE",
                            id: '"10000"|"data_types"|"public"|"TABLE"|"a"',
                            databaseName: "data_types",
                            objectName: "a",
                            isDeleted: false,
                            description: "This is a test of table description.",
                            entityType: "dataset",
                            instance: {
                                id: "10000",
                                name: "gillette"
                            },
                            workspaces: [],
                            comments: [],
                            highlightedAttributes: {
                                description: ["This is a <em>test<\/em> of table description."]
                            }
                        },
                        {
                            compositeId: '"10000"|"dca_demo"|"ddemo"|"QUERY"|"cv_us_president"',
                            content: "SELECT * FROM test AS a",
                            databaseName: "dca_demo",
                            datasetType: "CHORUS_VIEW",
                            entityType: "chorusView",
                            id: "10010",
                            instance: {
                                id: '10000',
                                name: 'gillette'
                            },
                            isDeleted: false,
                            objectName: "cv_us_president",
                            objectType: "QUERY",
                            schemaName: "ddemo",
                            workspace: {
                                id: '10000',
                                name: 'New Workspace'
                            },
                            comments: [],
                            highlightedAttributes: {
                                content: ["SELECT * FROM <em>test</em> AS a"]
                            }
                        },
                        {
                            schemaName: "analytics",
                            parentType: "gpdb_10000_Analytics",
                            objectType: "TABLE",
                            id: '"10000"|"Analytics"|"analytics"|"TABLE"|"test1"',
                            databaseName: "Analytics",
                            objectName: "test1",
                            isDeleted: false,
                            entityType: "dataset",
                            instance: {
                                id: "10000",
                                name: "gillette"
                            },
                            workspaces: [
                                {
                                    id: "10000",
                                    name: "danny"
                                }
                            ],
                            "comments": [],
                            highlightedAttributes: {}
                        },
                        {
                            "schemaName": "analytics",
                            "parentType": "gpdb_10000_Analytics",
                            "objectType": "TABLE",
                            "id": '"10000"|"Analytics"|"analytics"|"TABLE"|"test2"',
                            "databaseName": "Analytics",
                            "objectName": "test2",
                            "isDeleted": false,
                            "entityType": "dataset",
                            "instance": {
                                "id": "10000",
                                "name": "gillette"
                            },
                            "workspaces": [
                                {
                                    "id": "10000",
                                    "name": "danny"
                                }
                            ],
                            "comments": [],
                            highlightedAttributes: {}
                        },
                        {
                            "schemaName": "analytics",
                            "parentType": "gpdb_10000_Analytics",
                            "objectType": "TABLE",
                            "id": '"10000"|"Analytics"|"analytics"|"TABLE"|"test3"',
                            "databaseName": "Analytics",
                            "objectName": "test3",
                            "isDeleted": false,
                            "entityType": "dataset",
                            "instance": {
                                "id": "10000",
                                "name": "gillette"
                            },
                            "workspaces": [
                                {
                                    "id": "10000",
                                    "name": "danny"
                                }
                            ],
                            "comments": [],
                            highlightedAttributes: {}
                        },
                        {
                            "schemaName": "analytics",
                            "parentType": "gpdb_10000_Analytics",
                            "objectType": "TABLE",
                            "id": '"10000"|"Analytics"|"analytics"|"TABLE"|"test4"',
                            "databaseName": "Analytics",
                            "objectName": "test4",
                            "isDeleted": false,
                            "entityType": "dataset",
                            "instance": {
                                "id": "10000",
                                "name": "gillette"
                            },
                            "workspaces": [
                                {
                                    "id": "10000",
                                    "name": "danny"
                                }
                            ],
                            "comments": [],
                            highlightedAttributes: {}
                        },
                        {
                            "schemaName": "analytics",
                            "parentType": "gpdb_10000_Analytics",
                            "objectType": "TABLE",
                            "id": '"10000"|"Analytics"|"analytics"|"TABLE"|"test5"',
                            "databaseName": "Analytics",
                            "objectName": "test5",
                            "isDeleted": false,
                            "entityType": "dataset",
                            "instance": {
                                "id": "10000",
                                "name": "gillette"
                            },
                            "workspaces": [
                                {
                                    "id": "10000",
                                    "name": "danny"
                                }
                            ],
                            "comments": [],
                            highlightedAttributes: {}
                        },
                        {
                            "schemaName": "analytics",
                            "parentType": "gpdb_10000_Analytics",
                            "objectType": "TABLE",
                            "id": '"10000"|"Analytics"|"analytics"|"TABLE"|"test6"',
                            "databaseName": "Analytics",
                            "objectName": "test6",
                            "issearch_result_list.js:65Deleted": false,
                            "entityType": "dataset",
                            "instance": {
                                "id": "10000",
                                "name": "gillette"
                            },
                            "workspaces": [
                                {
                                    "id": "10000",
                                    "name": "danny"
                                }
                            ],
                            "comments": [],
                            highlightedAttributes: {}
                        },
                        {
                            "schemaName": "analytics",
                            "parentType": "gpdb_10000_Analytics",
                            "objectType": "TABLE",
                            "id": '"10000"|"Analytics"|"analytics"|"TABLE"|"test"',
                            "databaseName": "Analytics",
                            "objectName": "test",
                            "isDeleted": false,
                            "entityType": "dataset",
                            "instance": {
                                "id": "10000",
                                "name": "gillette"
                            },
                            "workspaces": [
                                {
                                    "id": "10000",
                                    "name": "danny"
                                }
                            ],
                            "comments": [],
                            highlightedAttributes: {}
                        },
                        {
                            "schemaName": "analytics",
                            "parentType": "gpdb_10000_Analytics",
                            "objectType": "TABLE",
                            "id": '"10000"|"Analytics"|"analytics"|"TABLE"|"test7"',
                            "databaseName": "Analytics",
                            "objectName": "test7",
                            "isDeleted": false,
                            "entityType": "dataset",
                            "instance": {
                                "id": "10000",
                                "name": "gillette"
                            },
                            "workspaces": [
                                {
                                    "id": "10000",
                                    "name": "danny"
                                }
                            ],
                            "comments": [],
                            highlightedAttributes: {}
                        }
                    ],
                    "numFound": 39
                },
                "instances": {
                    "results": [
                        {
                            "port": 5432,
                            "id": "10043",
                            "isDeleted": false,
                            "lastUpdatedStamp": "2012-03-07 12:59:45",
                            "host": "gillette",
                            "instanceProvider": "Greenplum Database",
                            "name": "my_instance",
                            "state": "fault",
                            "highlightedAttributes": {
                                "name": ["<em>my<\/em>_instance"]
                            },
                            "entityType": "instance",
                            "owner": {
                                "id": "InitialUser",
                                "lastName": "Admin",
                                "firstName": "EDC"
                            },
                            "comments": []
                        }
                    ],
                    "numFound": 1
                },
                "hadoop_instances": {
                    "results": [
                        {
                            "port": 8020,
                            "id": "10040",
                            "isDeleted": false,
                            "lastUpdatedStamp": "2012-03-07 12:59:45",
                            "host": "gillette",
                            "instanceProvider": "Hadoop",
                            "name": "my_hadoop",
                            "state": "online",
                            "highlightedAttributes": {
                                "name": ["<em>my<\/em>_hadoop"]
                            },
                            "entityType": "instance",
                            "owner": {
                                "id": "InitialUser",
                                "lastName": "Admin",
                                "firstName": "EDC"
                            },
                            "comments": []
                        }
                    ],
                    "numFound": 1
                },
                "users": {
                    "results": [
                        {
                            "admin": "false",
                            "comments": [],
                            "email": null,
                            "entityType": "user",
                            "firstName": "John",
                            "id": "10023",
                            "isDeleted": "false",
                            "lastName": "Doe",
                            "lastUpdatedStamp": "2012-03-01 11:07:13",
                            "name": "test",
                            "title": "",
                            "ou": "Test",
                            "content": "Hello",
                            "owner": {},
                            highlightedAttributes: {
                                "name": ["<em>test</em>"],
                                "ou": ["<em>Test</em>"]
                            }
                        },
                        {
                            admin: "false",
                            comments: [],
                            email: "test1@emc.com",
                            entityType: "user",
                            firstName: "Test",
                            id: "10020",
                            isDeleted: "false",
                            lastName: "McTest",
                            lastUpdatedStamp: "2012-03-01 11:06:05",
                            name: null,
                            title: "nobody",
                            ou: "",
                            content: "Test",
                            owner: {},
                            highlightedAttributes: {
                                firstName: ["<em>Test</em>"],
                                content: ["<em>Test</em>"]
                            }
                        },
                        {
                            admin: "false",
                            comments: [],
                            email: "test2@emc.com",
                            entityType: "user",
                            firstName: "Jack",
                            id: "10021",
                            isDeleted: "false",
                            lastName: "Test",
                            lastUpdatedStamp: "2012-03-01 11:06:32",
                            name: "",
                            "title": "tester",
                            owner: {},
                            highlightedAttributes: {
                                lastName: ["<em>Test</em>"],
                                "title": ["<em>test</em>er"]
                            }
                        }
                    ],
                    "numFound": 4
                },
                hdfs: {
                    results: [
                        {
                            comments: [],
                            entityType: "hdfs",
                            highlightedAttributes: {
                                name: ["Thumbs.<em>db</em>"]
                            },
                            hadoopInstance: {
                                id: "10001",
                                name: "hadoop"
                            },
                            lastUpdatedStamp: "2012-03-05 15:23:55",
                            name: "Thumbs.db",
                            path: "/webui/images/thirdparty/jquerybubblepopup-theme/green"

                        }
                    ],
                    numFound: 1
                },
                attachment: {
                    results: [
                        {
                            entityType: "hdfs",
                            id: "10000",
                            isDeleted: false,
                            lastUpdatedStamp: "2012-03-16 11:17:09",
                            fileId: "10000",
                            fileType: "CSV",
                            isBinary: true,
                            name: "titanic.csv",
                            highlightedAttributes: {
                                name: ["<em>titanic<\/em>.csv"]
                            },
                            owner: {
                                id: "InitialUser",
                                lastName: "Admin",
                                firstName: "EDC"
                            },
                            workspace: {
                                id: "10000",
                                name: "ws"
                            },
                            hdfs: {
                                id: "10020|/webui/help/publish/Data/Index.js",
                                name: "Index.js",
                                path: "/webui/help/publish/Data",
                                hadoopInstance: {
                                    id: "10020",
                                    name: "hadoooooooooop"
                                },
                                entityType: "hdfs"
                            },
                            comments: []
                        },
                        {
                            entityType: "workspace",
                            id: "10001",
                            isDeleted: false,
                            lastUpdatedStamp: "2012-03-16 11:18:32",
                            fileId: "10001",
                            fileType: "IMAGE",
                            isBinary: true,
                            name: "Titanic2.jpg",
                            highlightedAttributes: {
                                name: ["<em>Titanic<\/em>2.jpg"]
                            },
                            owner: {
                                id: "InitialUser",
                                lastName: "Admin",
                                firstName: "EDC"
                            },
                            workspace: {
                                id: "10000",
                                name: "ws"
                            },
                            comments: []
                        }
                    ],
                    numFound: 2
                }
            }, overrides)
        },

        searchResultDatasetJson: function(overrides) {
            return _.extend({
                schemaName: "public",
                parentType: "gpdb_10000_data_types",
                objectType: "TABLE",
                id: '"10000"|"data_types"|"public"|"TABLE"|"a"',
                databaseName: "data_types",
                objectName: "a",
                isDeleted: false,
                description: "This is a test of table description.",
                entityType: "dataset",
                instance: {
                    id: "10000",
                    name: "gillette"
                },
                workspaces: [],
                comments: [],
                highlightedAttributes: {
                    description: ["This is a <em>test<\/em> of table description."]
                }
            }, overrides);
        },

        searchResultAttachmentJson: function(overrides) {
            return _.extend({
                comments: [],
                entityType: "attachment",
                fileId: "10020",
                fileType: "IMAGE",
                highlightedAttributes: {name: ['<em>tracker</em>_dot.jpeg']},
                id: "10020",
                isBinary: true,
                isDeleted: false,
                lastUpdatedStamp: "2012-03-19 16:17:04",
                name: "tracker_dot.jpeg",
                owner: {id: 'InitialUser', lastName: 'Admin', firstName: 'EDC'},
                type: "attachment",
                workspace: {id: 10000, name: 'danny'}
            }, overrides);
        },

        searchResultChorusViewJson: function(overrides) {
            return _.extend({
                compositeId: '"10000"|"dca_demo"|"ddemo"|"QUERY"|"cv_us_president"',
                content: "SELECT * FROM test AS a",
                databaseName: "dca_demo",
                datasetType: "CHORUS_VIEW",
                entityType: "dataset",
                id: "10010",
                instance: {
                    id: '10000',
                    name: 'gillette'
                },
                isDeleted: false,
                objectName: "cv_us_president",
                objectType: "QUERY",
                schemaName: "ddemo",
                workspace: {
                    id: '10000',
                    name: 'New Workspace'
                },
                comments: [],
                highlightedAttributes: {
                    content: ["SELECT * FROM <em>test</em> AS a"]
                }
            }, overrides);
        },

        searchResultChorusView: function(overrides) {
            var attributes = this.searchResultChorusViewJson(overrides);
            return new chorus.models.WorkspaceDataset(attributes);
        },

        searchResultWorkfileJson: function(overrides) {
            return _.extend({
                    "lastUpdatedStamp": "2012-03-08 09:40:26",
                    "name": "foo.sql",
                    "fileType": "SQL",
                    "id": "10001",
                    "isDeleted": false,
                    "mimeType": "text/x-sql",
                    "highlightedAttributes": {
                        "name": [
                            "<em>foo<\/em>.sql"
                        ],
                        "commitMessage": [
                            "comment with <em>foo<\/em>"
                        ]
                    },
                    "entityType": "workfile",
                    "owner": {
                        "id": "InitialUser",
                        "lastName": "Admin",
                        "firstName": "EDC"
                    },
                    "workspace": {
                        "id": "10000",
                        "name": "a"
                    },
                    "versionInfo": {
                        "lastUpdatedStamp": "2012-03-08T09:40:26Z",
                        "versionFileId": "1331228426846_64",
                        "modifier": {
                            "id": "InitialUser",
                            "lastName": "Admin",
                            "firstName": "EDC"
                        },
                        "versionFilePath": "/Users/pivotal/workspace/chorus/ofbiz/runtime/data/workfile/10003/1332867012541_2971",
                        "versionOwner": "edcadmin",
                        "versionNum": 2
                    },
                    "comments": []
                },
                overrides);
        },

        searchResultHdfsJson: function(overrides) {
            return _.extend({
                comments: [
                    fixtures.searchResultCommentJson(),
                    fixtures.searchResultCommentJson()
                ],
                entityType: "hdfs",
                highlightedAttributes: {
                    name: ["Thumbs.<em>db</em>"]
                },
                hadoopInstance: {
                    id: "10001",
                    name: "hadoop"
                },
                isBinary: false,
                isDir: false,
                lastUpdatedStamp: "2012-03-05 15:23:55",
                name: "Thumbs.db",
                path: "/webui/images/thirdparty/jquerybubblepopup-theme/green",
                ancestors: []
            }, overrides);
        },

        searchResultCommentJson: function(overrides) {
            return _.extend({
                content: "nice data!",
                highlightedAttributes: {
                    content: ["nice <em>data</em>!"]
                },
                id: "10001",
                lastUpdatedStamp: "2012-03-07 15:03:43"
            }, overrides);
        },

        searchResultWorkspaceJson: function(overrides) {
            return _.extend({
                comments: [],
                entityType: "workspace",
                highlightedAttributes: {
                    name: ["<em>three</em>"]
                },
                id: "10011",
                isDeleted: false,
                public: true,
                lastUpdatedStamp: "2012-03-12 10:11:47",
                name: "three",
                owner: {
                    firstName: "EDC",
                    id: "InitialUser",
                    lastName: "Admin"
                },
                state: 0
            }, overrides);
        },

        searchResult: function(overrides) {
            return new chorus.models.SearchResult(this.searchResultJson(overrides))
        },

        emptySearchResult: function(overrides) {
            var model = new chorus.models.SearchResult(this.searchResultJson(overrides));
            _.each(_.keys(model.attributes), function(key) {
                var results = model.get(key);
                if (results.results) {
                    results.results = [];
                    results.numFound = 0;
                }
            });

            return model;
        },

        typeAheadSearchResultJson: function(overrides) {
            return _.extend({
                "typeAhead": {
                    "results": [
                        {
                            "lastUpdatedStamp": "2012-03-16 12:33:15",
                            "type": "attachment",
                            "name": "Titanic2 (1).jpg",
                            "fileType": "IMAGE",
                            "id": "10002",
                            "isDeleted": false,
                            "fileId": "10002",
                            "entityType": "attachment",
                            "highlightedAttributes": {
                                "name": ["<em>Titanic<\/em>2 (1).jpg"]
                            },
                            "owner": {
                                "id": "InitialUser",
                                "lastName": "Admin",
                                "firstName": "EDC"
                            },
                            "workspace": {},
                            "instance": {
                                "port": 5432,
                                "id": "10000",
                                "host": "gillette.sf.pivotallabs.com",
                                "provision_type": "register",
                                "name": "gillette",
                                "owner": {
                                    "id": "InitialUser",
                                    "lastName": "Admin",
                                    "firstName": "EDC"
                                },
                                "state": "online",
                                "instanceProvider": "Greenplum Database",
                                "isDeleted": false,
                                "entityType": "instance",
                                "database": "postgres"
                            },
                            "comments": []
                        },

                        {
                            "entityType": "hdfs",
                            "id": "10021",
                            "name": "EdcViews.js",
                            "path": "/webui/js/chorus/app/views/EdcViews.js",
                            isBinary: false,
                            isDir: false,
                            "lastUpdatedStamp": "2012-03-14 16:46:40",
                            "highlightedAttributes": {
                                "name": ["<em>Edc<\/em>Views.js"]
                            },
                            "hadoopInstance": {
                                "id": "10020",
                                "name": "hadoooooooooop"
                            },
                            "comments": []
                        },

                        {
                            "lastUpdatedStamp": "2012-03-09 17:50:58",
                            "state": 1,
                            "entityType": "workspace",
                            "id": "10000",
                            "isDeleted": false,
                            "public": true,
                            "name": "ws",
                            "highlightedAttributes": {
                                "name": ["<em>ws<\/em>"]
                            },
                            "owner": {
                                "id": "InitialUser",
                                "lastName": "Admin",
                                "firstName": "EDC"
                            },
                            "active": true,
                            "comments": []
                        },

                        {
                            "port": 5432,
                            "host": "gillette.sf.pivotallabs.com",
                            "lastUpdatedStamp": "2012-03-16 16:39:14",
                            "state": "online",
                            "provision_type": "register",
                            "entityType": "instance",
                            "instanceProvider": "Greenplum Database",
                            "id": "10000",
                            "isDeleted": false,
                            "name": "gillette",
                            "highlightedAttributes": {
                                "name": ["<em>gillette<\/em>"]
                            },
                            "owner": {
                                "id": "InitialUser",
                                "lastName": "Admin",
                                "firstName": "EDC"
                            },
                            "comments": []
                        },

                        {
                            "lastUpdatedStamp": "2012-03-16 10:40:36",
                            "entityType": "user",
                            "id": "10010",
                            "name": "user1",
                            "firstName": "user1",
                            "isDeleted": false,
                            "admin": false,
                            "lastName": "user1",
                            "email": "user1@user.com",
                            "highlightedAttributes": {
                                "lastName": ["<em>user<\/em>1"],
                                "name": ["<em>user<\/em>1"],
                                "firstName": ["<em>user<\/em>1"]
                            },
                            "owner": {},
                            "comments": []

                        },

                        {
                            "lastUpdatedStamp": "2012-03-14 17:15:21",
                            "entityType": "workfile",
                            "fileType": "TXT",
                            "id": "10030",
                            "isDeleted": false,
                            "mimeType": "text/plain",
                            "fileName": "buildout.txt",
                            "highlightedAttributes": {
                                "fileName": ["<em>buildout</em>.txt"]
                            },
                            "owner": {
                                "id": "InitialUser",
                                "lastName": "Admin",
                                "firstName": "EDC"
                            },
                            "workspace": {
                                "id": "10000",
                                "name": "ws"
                            },
                            "versionInfo": {
                                "lastUpdatedStamp": "2012-03-14T17:15:21Z",
                                "versionFileId": "1331770521971_1380",
                                "modifier": {
                                    "id": "InitialUser",
                                    "lastName": "Admin",
                                    "firstName": "EDC"
                                },
                                "versionFilePath": "/Users/pivotal/workspace/chorus/ofbiz/runtime/data/workfile/10003/1332867012541_2971",
                                "versionOwner": "edcadmin",
                                "versionNum": 1
                            },
                            "comments": []
                        },

                        {
                            "schemaName": "ddemo",
                            "entityType": "dataset",
                            "id": '10000\"|"dca_demo"|"ddemo"|"TABLE"|"_uspresident"',
                            "objectType": "TABLE",
                            "databaseName": "dca_demo",
                            "workspaceIds": ["10000", "10030"],
                            "objectName": "_uspresident",
                            "highlightedAttributes": {
                                "objectName": ["_<em>uspresident</em>"]
                            },
                            "instance": {
                                "id": "10000",
                                "name": "gillette"
                            },
                            "workspaces": [
                                {
                                    "id": "10000",
                                    "datasetType": "SANDBOX_TABLE",
                                    "name": "ws"
                                },
                                {
                                    "id": "10030",
                                    "datasetType": "SANDBOX_TABLE",
                                    "name": "has_sandbox"
                                }
                            ],
                            "comments": []
                        },

                        {
                            "entityType": "chorusView",
                            "id": '10000"|"dca_demo"|"ddemo"|"QUERY"|"chorus_view"',
                            "isDeleted": false,
                            "lastUpdatedStamp": "2012-03-21 10:15:11",
                            "datasetType": "CHORUS_VIEW",
                            "databaseName": "dca_demo",
                            "schemaName": "ddemo",
                            "objectType": "QUERY",
                            "content": 'SELECT a.position_title FROM "2010_report_on_white_house" AS a',
                            "objectName": "chorus_view",
                            "highlightedAttributes": {
                                "objectName": ["<em>chorus_view</em>"]
                            },
                            "owner": {
                                "id": "InitialUser",
                                "lastName": "Admin",
                                "firstName": "EDC"
                            },
                            "workspace": {
                                "id": "10000",
                                "name": "ws"
                            },
                            "instance": {
                                "id": "10000",
                                "name": "gillette"
                            },
                            "comments": []
                        }
                    ],
                    "numFound": 3
                }
            }, overrides)
        },

        typeAheadSearchResult: function(overrides) {
            return new chorus.models.TypeAheadSearchResult(fixtures.typeAheadSearchResultJson(overrides));
        },

        tableauWorkbookJson: function(overrides) {
            return _.extend({
                "name": "MyTableauWorkbook",
                "id": fixtures.nextId().toString(),
                "url": "http://base.url/workbooks/MyTableauWorkbook"
            }, overrides);
        }
    });
});
