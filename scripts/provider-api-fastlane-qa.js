'use strict';
const assert=require('assert');
const {apiDescriptorForUrl,apiSeedFromJson,spigotResourceId,hangarProjectSlug,gitlabProjectPath}=require('../src/provider-api-fastlane');

const spigot='https://www.spigotmc.org/resources/worldedit.53036/';
assert.equal(spigotResourceId(spigot),'53036');
const spigotDesc=apiDescriptorForUrl(spigot);
assert.equal(spigotDesc?.apiUrl,'https://api.spiget.org/v2/resources/53036');
const spigotSeed=apiSeedFromJson(spigotDesc,{id:53036,name:'WorldEdit',icon:{url:'/data/resource_icons/53/53036.jpg?1700000'}},{title:'WorldEdit'});
assert.equal(spigotSeed?.icon?.url,'https://www.spigotmc.org/data/resource_icons/53/53036.jpg?1700000');
assert.equal(spigotSeed?.provider,'spigot');
assert.equal(spigotSeed?.exclusive,false,'API seed must never suppress canonical gallery enrichment');

const hangar='https://hangar.papermc.io/ViaVersion/ViaVersion';
assert.equal(hangarProjectSlug(hangar),'ViaVersion');
const hangarDesc=apiDescriptorForUrl(hangar);
assert.equal(hangarDesc?.apiUrl,'https://hangar.papermc.io/api/v1/projects/ViaVersion');
const hangarSeed=apiSeedFromJson(hangarDesc,{namespace:{owner:'ViaVersion',slug:'ViaVersion'},name:'ViaVersion',avatarUrl:'https://hangar.papermc.io/api/v1/projects/ViaVersion/avatar'},{title:'ViaVersion'});
assert.equal(hangarSeed?.icon?.url,'https://hangar.papermc.io/api/v1/projects/ViaVersion/avatar');
assert.equal(hangarSeed?.provider,'hangar');

const gitlab='https://gitlab.com/example-group/example-project';
assert.equal(gitlabProjectPath(gitlab),'example-group/example-project');
const gitlabDesc=apiDescriptorForUrl(gitlab);
assert.equal(gitlabDesc?.apiUrl,'https://gitlab.com/api/v4/projects/example-group%2Fexample-project');
const gitlabSeed=apiSeedFromJson(gitlabDesc,{id:123,path_with_namespace:'example-group/example-project',name:'Example Project',avatar_url:'https://gitlab.com/uploads/-/system/project/avatar/123/example.png'},{title:'Example Project'});
assert.equal(gitlabSeed?.icon?.url,'https://gitlab.com/uploads/-/system/project/avatar/123/example.png');
assert.equal(gitlabSeed?.provider,'gitlab');

for(const bad of ['https://www.spigotmc.org/resources/','https://hangar.papermc.io/','https://gitlab.com/groups/example/-/projects','https://example.com/project'])assert.equal(apiDescriptorForUrl(bad),null,`generic/index URL must not be treated as exact public API entity: ${bad}`);
console.log(JSON.stringify({passed:true,providers:['spigot','hangar','gitlab'],apiSeeds:3,exclusive:false}));
assert.equal(apiSeedFromJson(spigotDesc,{id:53037,name:'WorldEdit',icon:{url:'/wrong.png'}}),null);
assert.equal(apiSeedFromJson(spigotDesc,{name:'WorldEdit',icon:{url:'/wrong.png'}}),null);
assert.equal(apiSeedFromJson(hangarDesc,{namespace:{owner:'Different',slug:'ViaVersion'},name:'ViaVersion',avatarUrl:'https://hangar.papermc.io/wrong.png'}),null);
assert.equal(apiSeedFromJson(gitlabDesc,{id:124,path_with_namespace:'another/example-project',name:'Example Project',avatar_url:'https://gitlab.com/wrong.png'}),null);
assert.equal(apiDescriptorForUrl('https://gitlab.com/owner/%2Fproject'),null);
assert.equal(apiDescriptorForUrl('https://user:pass@www.spigotmc.org/resources/worldedit.53036/'),null);
console.log('Exact provider response identity and malformed routes verified');
