# Patch public HTML for CMS hooks and site-content.js
$files = @(
  'index.html','meet-dr-fowler.html','services.html','staff.html',
  'patient-resources.html','contact.html','404.html'
)
$root = 'c:\tjfowler-main'
foreach ($f in $files) {
  $p = Join-Path $root $f
  $t = Get-Content $p -Raw
  $t = $t -replace 'js/site-loader\.js','js/site-content.js'
  # Nav link keys
  $t = $t -replace '(<a href="index\.html"[^>]*)(>)','$1 data-link-key="nav-home"$2'
  $t = $t -replace '(<a href="meet-dr-fowler\.html"[^>]*)(>)','$1 data-link-key="nav-meet-dr"$2'
  $t = $t -replace '(<a href="services\.html"[^>]*)(>)','$1 data-link-key="nav-services"$2'
  $t = $t -replace '(<a href="staff\.html"[^>]*)(>)','$1 data-link-key="nav-staff"$2'
  $t = $t -replace '(<a href="patient-resources\.html"[^>]*)(>)','$1 data-link-key="nav-patient-resources"$2'
  $t = $t -replace '(<a href="contact\.html"[^>]*)(>)','$1 data-link-key="nav-contact"$2'
  # Footer
  $t = $t -replace '<p class="site-footer__heading">Quick Links</p>','<p class="site-footer__heading" data-editable="footer-quick-links-heading">Quick Links</p>'
  $t = $t -replace '<p class="site-footer__heading">Office Hours</p>','<p class="site-footer__heading" data-editable="footer-hours-heading">Office Hours</p>'
  if ($t -notmatch 'data-editable="footer-copyright"') {
    $t = $t -replace '(<div class="site-footer__bottom">\s*<p)(>)','$1 data-editable="footer-copyright"$2'
  }
  $t = $t -replace '<a href="admin\.html">Staff login</a>','<a href="admin.html"><span data-editable="staff-login-label">Staff login</span></a>'
  $t = $t -replace '(class="mobile-call"[^>]*>)(Call Now)(</a>)','$1<span data-editable="mobile-call-label">$2</span>$3'
  Set-Content $p $t -NoNewline
}
Write-Output 'HTML patched'
