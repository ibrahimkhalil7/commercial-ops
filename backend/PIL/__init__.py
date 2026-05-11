"""
Local stub for PIL used to satisfy Django ImageField import checks during
local development when installing Pillow is not possible (e.g., Python 3.14
without prebuilt wheels on Windows).

This is intentionally minimal and only prevents import errors. Do NOT use
in production — install the real Pillow package instead.
"""
class _DummyImageModule:
    @staticmethod
    def open(fp):
        raise RuntimeError(
            "Pillow is not installed; attempted to open image file: %r" % fp
        )


Image = _DummyImageModule()
