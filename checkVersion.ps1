##
## Purpose of this PowerShell script is to check version strings in several files for 
## the PCF control "OpenAIGPTAssistedColumnPCF".
## 
## At this point, policy of this control is that all of the following version strings 
## must be same:
##   - Solution version for the solution file of "Solution.xml"
##   - Manifest version for the control in "ControlManifest.Input.xml" file
##   - Readonly variable used in code of "index.ts" file
## 
## This script assumes the version string is such as "1.0.4" which doesn't include 
## characters.
## This script assumes to be used in package.json for "prebuild" script to be executed 
## just before the "build" script by listing as the following:
##    "scripts": {
##      "build": "pcf-scripts build",
##      ...
##      "prebuild": "pwsh ./checkVersion.ps1"
##    },
## This script returns 0 when checking version succeeded in order to execute next "build" script.
## This script returns other than 0 when checking version failed in order to stop "build" steps.
##

echo 'Checking version string in several files for OpenAIGPTAssistedColumnPCF'
$SolutionVersion = ((Get-Content .\OpenAIGPTAssistedColumn\Solutions\src\Other\Solution.xml | Select-String -Pattern '<Version>') -replace '^ *<Version>', '') -replace '[^0-9\.]', ''
$message = @('-> Solution Version', $SolutionVersion) -join ' = '
echo $message

$ManifestVersion = ((Get-Content .\OpenAIGPTAssistedColumn\ControlManifest.Input.xml | Select-String -Pattern 'version')[1] -replace '^ *version', '') -replace '[^0-9\.]', ''
$message = @('-> Manifest Version', $ManifestVersion) -join ' = '
echo $message

$VersionInCode =((Get-Content .\OpenAIGPTAssistedColumn\index.ts | Select-String -Pattern 'version *=') -replace '^.*=', '') -replace '[^0-9\.]', ''
$message = @('-> Version in Code', $VersionInCode) -join '  = '
echo $message

if(($SolutionVersion -eq $ManifestVersion) -and ($SolutionVersion -eq $VersionInCode)){
  echo 'Checking version succeeded'
  exit 0
}else{
  echo 'Checking version failed'
  exit -1
}

