"""Create the static deployment directory and the matching upload-ready ZIP."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import os
import shutil
import stat


def clear_readonly(function, path, exception_info):
    """Allow rebuilding generated files in Windows/OneDrive directories."""
    if not isinstance(exception_info[1], PermissionError):
        raise exception_info[1]
    os.chmod(path, stat.S_IWRITE)
    function(path)

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
artifacts = root / "artifacts"
if dist.exists():
    # Only clear this script's fixed output directory inside the repository.
    if dist.is_symlink() or dist.resolve() != root / "dist":
        raise RuntimeError("Refusing to clear an unexpected output directory")
    shutil.rmtree(dist, onerror=clear_readonly)
dist.mkdir()
artifacts.mkdir(exist_ok=True)

for name in ["index.html", "404.html", "thankyou.html", "robots.txt", "sitemap.xml"]:
    shutil.copy2(root / name, dist / name)
for name in ["css", "js", "fonts", "images"]:
    shutil.copytree(root / name, dist / name, ignore=shutil.ignore_patterns("Thumbs.db", "*.psd"))

archive = artifacts / "Healthy-Start-staging.zip"
with ZipFile(archive, "w", ZIP_DEFLATED) as output:
    for path in sorted(dist.rglob("*")):
        if path.is_file():
            output.write(path, path.relative_to(dist).as_posix())
print(f"Created {archive.name} ({archive.stat().st_size:,} bytes); index.html is at the ZIP root.")
