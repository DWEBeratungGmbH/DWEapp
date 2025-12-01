$path = "C:\Dev\weclapp-manager\id_rsa"
$acl = Get-Acl $path
$acl.SetAccessRuleProtection($true, $false)
$administrators = New-Object System.Security.AccessControl.FileSystemAccessRule("Administrators", "FullControl", "Allow")
$owner = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "FullControl", "Allow")
$acl.AddAccessRule($administrators)
$acl.AddAccessRule($owner)
Set-Acl $path $acl
Write-Host "Permissions fixed for $path"
