'use strict';
const assert=require('assert');
const {apiDescriptorForUrl,apiSeedFromJson,spigotResourceId,hangarProjectSlug,gitlabProjectPath}=require('../src/provider-api-fastlane');

const spigot='https://www.spigotmc.org/resources/worldedit.53036/';
assert.equal(spigotResourceId(spigot),'53036');
const spigotDesc=apiDescriptorForUrl(spigot);
assert.equal(spigotDesc?.apiUrl,'https://api.spiget.org/v2/resources/53036');
const spigotSeed=apiSeedFromJson(spigotDesc,{name:'WorldEdit',icon:{url:'/data/resource_icons/53/53036.jpg?1700000'}},{title:'WorldEdit'});
assert.equal(spigotSeed?.icon?.url,'https://www.spigotmc.org/data/resource_icons/53/53036.jpg?1700000');
assert.equal(spigotSeed?.provider,'spigot');
assert.equal(spigotSeed?.exclusive,false,'API seed must never suppress canonical gallery enrichment');

const hangar='https://hangar.papermc.io/ViaVersion/ViaVersion';
assert.equal(hangarProjectSlug(hangar),'ViaVersion');
const hangarDesc=apiDescriptorForUrl(hangar);
assert.equal(hangarDesc?.apiUrl,'https://hangar.papermc.io/api/v1/projects/ViaVersion');
const hangarSeed=apiSeedFromJson(hangarDesc,{name:'ViaVersion',avatarUrl:'https://hangar.papermc.io/api/v1/projects/ViaVersion/avatar'},{title:'ViaVersion'});
assert.equal(hangarSeed?.icon?.url,'https://hangar.papermc.io/api/v1/projects/ViaVersion/avatar');
assert.equal(hangarSeed?.provider,'hangar');

const gitlab='https://gitlab.com/example-group/example-project';
assert.equal(gitlabProjectPath(gitlab),'example-group/example-project');
const gitlabDesc=apiDescriptorForUrl(gitlab);
assert.equal(gitlabDesc?.apiUrl,'https://gitlab.com/api/v4/projects/example-group%2Fexample-project');
const gitlabSeed=apiSeedFromJson(gitlabDesc,{name:'Example Project',avatar_url:'https://gitlab.com/uploads/-/system/project/avatar/123/example.png'},{title:'Example Project'});
assert.equal(gitlabSeed?.icon?.url,'https://gitlab.com/uploads/-/system/project/avatar/123/example.png');
assert.equal(gitlabSeed?.provider,'gitlab');

for(const bad of ['https://www.spigotmc.org/resources/','https://hangar.papermc.io/','https://gitlab.com/groups/example/-/projects','https://example.com/project'])assert.equal(apiDescriptorForUrl(bad),null,`generic/index URL must not be treated as exact public API entity: ${bad}`);
console.log(JSON.stringify({passed:true,providers:['spigot','hangar','gitlab'],apiSeeds:3,exclusive:false}));
