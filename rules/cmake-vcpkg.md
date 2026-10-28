---
trigger: model_decision
description: C++ project configuration and package management. Applies to files matching **/*.cmake, **/CMakeLists.txt, **/*.cpp, **/*.h, **/*.hpp.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/cmake-vcpkg.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Aaron Powell
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.cmake`, `**/CMakeLists.txt`, `**/*.cpp`, `**/*.h`, `**/*.hpp`.

This project uses vcpkg in manifest mode. Please keep this in mind when giving vcpkg suggestions. Do not provide suggestions like vcpkg install library, as they will not work as expected.
Prefer setting cache variables and other types of things through CMakePresets.json if possible.
Give information about any CMake Policies that might affect CMake variables that are suggested or mentioned.
This project needs to be cross-platform and cross-compiler for MSVC, Clang, and GCC.
When providing OpenCV samples that use the file system to read files, please always use absolute file paths rather than file names, or relative file paths. For example, use `video.open("C:/project/file.mp4")`, not `video.open("file.mp4")`.
