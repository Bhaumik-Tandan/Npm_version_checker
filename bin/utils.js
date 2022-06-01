module.exports = { readCsv:readCsv};
var {parse}=require("csv-parse");
var fs = require('fs'); 
const axios = require('axios');

async function getDefaultBranch(owner,repo)
{
    const url='https://api.github.com/repos/'+owner+'/'+repo;
    const response=await axios.get(url)
    return response.data.default_branch;
}

async function splitUrl(url)
{
  const urlParts = url.split('/');
  const config={
    owner:urlParts[3],
    repo:urlParts[4],
  };
  const defaultBranch=await getDefaultBranch(config.owner,config.repo);
  return {
    ...config,
    defaultBranch
  };
}

async function getPackageFile({owner,repo,defaultBranch:branch})
{
    const url=`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`;
    const response=await axios.get(url);
    return response.data;
}

function greaterThanEqualTo(packageVersion,cliVersion)
{
  const [cliMajor,cliMinor,cliPatch]=cliVersion.split('.');
  const [packageMajor,packageMinor,packagePatch]=packageVersion.split('.');
  if(parseInt(packageMajor)>parseInt(cliMajor))
  {
    return true;
  }
  else if(parseInt(packageMajor)===parseInt(cliMajor))
  {
    if(parseInt(packageMinor)>parseInt(cliMinor))
    {
      return true;
    }
    else if(parseInt(packageMinor)===parseInt(cliMinor))
    {
      if(parseInt(packagePatch)>=parseInt(cliPatch))
      {
        return true;
      }
      else
      {
        return false;
      }
    }
    else
    {
      return false;
    }
  }
  else
  {
    return false;
  }
}

async function process(data,packageName)
{
   const output=[];
    for(var i=0;i<data.length;i++){
   const config= await splitUrl(data[i][1]);
   const packageJson=await getPackageFile(config);
   const [name,version]=packageName.split('@');
   const packageVersion=packageJson.dependencies[name].slice(1);
   const version_satisfied=greaterThanEqualTo(packageVersion,version);
    output.push({
      name:data[i][0],
      repo:data[i][1],
      version:packageVersion,
      version_satisfied
    });
  }
  console.table(output);
}

function readCsv(path,packageName)
{
    var csvData=[];
    fs.createReadStream(path)
    .pipe(parse())
    .on('data', function(csvrow) {
        csvData.push(csvrow);        
    })
    .on('end',function() {
      process(csvData.slice(1),packageName);
    });
}
