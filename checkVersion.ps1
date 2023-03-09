echo 'Checking version string in several files for OpenAIGPTAssistedColumnPCF'
$SolutionVersion = ((Get-Content .\OpenAIGPTAssistedColumn\Solutions\src\Other\Solution.xml | Select-String -Pattern '<Version>') -replace '^ *<Version>', '') -replace '[^0-9\.]', ''
$message = @('-> Solution Version', $SolutionVersion) -join ' = '
echo $message

$ManifestVersion = ((Get-Content .\OpenAIGPTAssistedColumn\ControlManifest.Input.xml | Select-String -Pattern 'version="')[1] -replace '^ *version="', '') -replace '[^0-9\.]', ''
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

