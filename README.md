# Page Manager plugin

---

Page manager is a simple Adobe Photoshop plugin made to simplify organization while working in Scanlation. At the same
time, it also comes with the benefit of not filling your scratch disks as fast since you only have one page open at a
time. It aims to simplify and normalize more descriptive naming of files as well as just make the workflow faster.

## Key features
- **Movement between pages:** You can easily move between pages without having to open multiple of them manually
- **Naming based on patterns:** You can name your files based on multitude of patterns such as page numbers.
- **Automatic saving:** Files can autosave on open with the naming pattern picked
- **Shortcuts:** Can use actions shortcuts to easily run the other functionality without having to click even while plugin isn't focused.
- **Preset saving:** Project files configurations and naming patterns can be saved
- **Adjustable settings:** Most of the functionality mentioned above can be changed with settings in the plugin

## Requirements

- Adobe Photoshop CC 2021 or newer (the framework used to build this unfortunately doesn't work in lower versions)

## Installation guide

### Release version
1. Download the latest release
2. Extract the archive and execute the installation script for your operating system

   For Windows:
```shell
install_win.cmd
```

### Source code installation
1. Clone the repository
2. Install the dependencies
3. Run the build
4. Run the installation script for your operating system

   For Windows:
    ```shell
    install_win.cmd
    ```

## Usage
You can find the plugin underneath the Plugins tab in your Photoshop. Click the Page Manager tab and select all the
panels you would like to use. Settings and About information can also be found underneath this tab, however they cannot
be open at all times unlike the other panels.

[Click here for a simple guide!](Guide.md)

## Known issues

### Files don't load

There are multiple reasons for why this could be happening. If your folder or files
contain any of these characters: `\/:*?"<>|#`, the system won't find it. These are
also characters that Windows doesn't recommend, so please name your files with normal words rather than special characters and the plugin will work.

## Special thanks

### Testers
@ru - helping me find the unsupported symbols in file paths<br/>
@adrian - my mac tester<br/>
@Writer - testing and moral support<br/>
@Ryujin1108 - suggesting new features and testing

## Contributing
While I don't take code contributions, feature suggestions are very welcome. You can create an issue here on github about it
and I will later respond if I am adding a feature.
