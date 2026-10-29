---
trigger: model_decision
description: Instructions for upgrading .NET MAUI applications from version 9 to version 10, including breaking changes, deprecated APIs, and migration strategies for ListView to CollectionView. Applies to files matching **/*.csproj, **/*.cs, **/*.xaml.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/dotnet-maui-9-to-dotnet-maui-10-upgrade.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Shane Neuville
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.csproj`, `**/*.cs`, `**/*.xaml`.

# Upgrading from .NET MAUI 9 to .NET MAUI 10

This guide helps you upgrade your .NET MAUI application from .NET 9 to .NET 10 by focusing on the critical breaking changes and obsolete APIs that require code updates.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Update Target Framework](#update-target-framework)
3. [Breaking Changes (P0 - Must Fix)](#breaking-changes-p0---must-fix)
   - [MessagingCenter Made Internal](#messagingcenter-made-internal)
   - [ListView and TableView Deprecated](#listview-and-tableview-deprecated)
4. [Deprecated APIs (P1 - Fix Soon)](#deprecated-apis-p1---fix-soon)
   - [Animation Methods](#1-animation-methods)
   - [DisplayAlert and DisplayActionSheet](#2-displayalert-and-displayactionsheet)
   - [Page.IsBusy](#3-pageisbusy)
   - [MediaPicker APIs](#4-mediapicker-apis)
5. [Recommended Changes (P2)](#recommended-changes-p2)
6. [Bulk Migration Tools](#bulk-migration-tools)
7. [Testing Your Upgrade](#testing-your-upgrade)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

**Five-Step Upgrade Process:**

1. **Update TargetFramework** to `net10.0`
2. **Update CommunityToolkit.Maui** to 12.3.0+ (if you use it) - REQUIRED
3. **Fix breaking changes** - MessagingCenter (P0)
4. **Migrate ListView/TableView to CollectionView** (P0 - CRITICAL)
5. **Fix deprecated APIs** - Animation methods, DisplayAlert, IsBusy, MediaPicker (P1)

> ⚠️ **Major Breaking Changes**: 
> - CommunityToolkit.Maui **must** be version 12.3.0 or later
> - ListView and TableView are now obsolete (most significant migration effort)

---

## Update Target Framework

### Single Platform

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
</Project>
```

### Multi-Platform

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFrameworks>net10.0-android;net10.0-ios;net10.0-maccatalyst;net10.0-windows10.0.19041.0</TargetFrameworks>
  </PropertyGroup>
</Project>
```

### Optional: Linux Compatibility (Google Antigravity, WSL, etc.)

> 💡 **For Linux Development**: If you're building on Linux (e.g., GitHub Codespaces, WSL, or using Google Antigravity), you can make your project compile on Linux by conditionally excluding iOS/Mac Catalyst targets:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <!-- Start with Android (always supported) -->
    <TargetFrameworks>net10.0-android</TargetFrameworks>
    
    <!-- Add iOS/Mac Catalyst only when NOT on Linux -->
    <TargetFrameworks Condition="!$([MSBuild]::IsOSPlatform('linux'))">$(TargetFrameworks);net10.0-ios;net10.0-maccatalyst</TargetFrameworks>
    
    <!-- Add Windows only when on Windows -->
    <TargetFrameworks Condition="$([MSBuild]::IsOSPlatform('windows'))">$(TargetFrameworks);net10.0-windows10.0.19041.0</TargetFrameworks>
  </PropertyGroup>
</Project>
```

**Benefits:**
- ✅ Compiles successfully on Linux (no iOS/Mac tools required)
- ✅ Works with GitHub Codespaces and Copilot
- ✅ Automatically includes correct targets based on build OS
- ✅ No changes needed when switching between OS environments

**Reference:** [dotnet/maui#32186](https://github.com/dotnet/maui/pull/32186)

### Update Required NuGet Packages

> ⚠️ **CRITICAL**: If you use CommunityToolkit.Maui, you **must** update to version 12.3.0 or later. Earlier versions are not compatible with .NET 10 and will cause compilation errors.

```bash
# Update CommunityToolkit.Maui (if you use it)
dotnet add package CommunityToolkit.Maui --version 12.3.0

# Update other common packages to .NET 10 compatible versions
dotnet add package Microsoft.Maui.Controls --version 10.0.0
```

**Check all your NuGet packages:**
```bash
# List all packages and check for updates
dotnet list package --outdated

# Update all packages to latest compatible versions
dotnet list package --outdated | grep ">" | cut -d '>' -f 1 | xargs -I {} dotnet add package {}
```

---

## Breaking Changes (P0 - Must Fix)

### MessagingCenter Made Internal

**Status:** 🚨 **BREAKING** - `MessagingCenter` is now `internal` and cannot be accessed.

**Error You'll See:**
```
error CS0122: 'MessagingCenter' is inaccessible due to its protection level
```

**Migration Required:**

#### Step 1: Install CommunityToolkit.Mvvm

```bash
dotnet add package CommunityToolkit.Mvvm --version 8.3.0
```

#### Step 2: Define Message Classes

```csharp
// OLD: No message class needed
MessagingCenter.Send(this, "UserLoggedIn", userData);

// NEW: Create a message class
public class UserLoggedInMessage
{
    public UserData Data { get; set; }
    
    public UserLoggedInMessage(UserData data)
    {
        Data = data;
    }
}
```

#### Step 3: Update Send Calls

```csharp
// ❌ OLD (Broken in .NET 10)
using Microsoft.Maui.Controls;

MessagingCenter.Send(this, "UserLoggedIn", userData);
MessagingCenter.Send<App, string>(this, "StatusChanged", "Active");

// ✅ NEW (Required)
using CommunityToolkit.Mvvm.Messaging;

WeakReferenceMessenger.Default.Send(new UserLoggedInMessage(userData));
WeakReferenceMessenger.Default.Send(new StatusChangedMessage("Active"));
```

#### Step 4: Update Subscribe Calls

```csharp
// ❌ OLD (Broken in .NET 10)
MessagingCenter.Subscribe<App, UserData>(this, "UserLoggedIn", (sender, data) =>
{
    // Handle message
    CurrentUser = data;
});

// ✅ NEW (Required)
WeakReferenceMessenger.Default.Register<UserLoggedInMessage>(this, (recipient, message) =>
{
    // Handle message
    CurrentUser = message.Data;
});
```

#### ⚠️ Important Behavioral Difference: Duplicate Subscriptions

**WeakReferenceMessenger** throws an `InvalidOperationException` if you try to register the same message type multiple times on the same recipient (MessagingCenter allowed this):

```csharp
// ❌ This THROWS InvalidOperationException in WeakReferenceMessenger
WeakReferenceMessenger.Default.Register<UserLoggedInMessage>(this, (r, m) => Handler1(m));
WeakReferenceMessenger.Default.Register<UserLoggedInMessage>(this, (r, m) => Handler2(m)); // ❌ THROWS!

// ✅ Solution 1: Unregister before re-registering
WeakReferenceMessenger.Default.Unregister<UserLoggedInMessage>(this);
WeakReferenceMessenger.Default.Register<UserLoggedInMessage>(this, (r, m) => Handler1(m));

// ✅ Solution 2: Handle multiple actions in one registration
WeakReferenceMessenger.Default.Register<UserLoggedInMessage>(this, (r, m) => 
{
    Handler1(m);
    Handler2(m);
});
```

**Why this matters:** If your code subscribes to the same message in multiple places (e.g., in a page constructor and in `OnAppearing`), you'll get a runtime crash.

#### Step 5: Unregister When Done

```csharp
// ❌ OLD
MessagingCenter.Unsubscribe<App, UserData>(this, "UserLoggedIn");

// ✅ NEW (CRITICAL - prevents memory leaks)
WeakReferenceMessenger.Default.Unregister<UserLoggedInMessage>(this);

// Or unregister all messages for this recipient
WeakReferenceMessenger.Default.UnregisterAll(this);
```

#### Complete Before/After Example

**Before (.NET 9):**
```csharp
// Sender
public class LoginViewModel
{
    public async Task LoginAsync()
    {
        var user = await AuthService.LoginAsync(username, password);
        MessagingCenter.Send(this, "UserLoggedIn", user);
    }
}

// Receiver
public partial class MainPage : ContentPage
{
    public MainPage()
    {
        InitializeComponent();
        
        MessagingCenter.Subscribe<LoginViewModel, User>(this, "UserLoggedIn", (sender, user) =>
        {
            WelcomeLabel.Text = $"Welcome, {user.Name}!";
        });
    }
    
    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        MessagingCenter.Unsubscribe<LoginViewModel, User>(this, "UserLoggedIn");
    }
}
```

**After (.NET 10):**
```csharp
// 1. Define message
public class UserLoggedInMessage
{
    public User User { get; }
    
    public UserLoggedInMessage(User user)
    {
        User = user;
    }
}

// 2. Sender
public class LoginViewModel
{
    public async Task LoginAsync()
    {
        var user = await AuthService.LoginAsync(username, password);
        WeakReferenceMessenger.Default.Send(new UserLoggedInMessage(user));
    }
}

// 3. Receiver
public partial class MainPage : ContentPage
{
    public MainPage()
    {
        InitializeComponent();
        
        WeakReferenceMessenger.Default.Register<UserLoggedInMessage>(this, (recipient, message) =>
        {
            WelcomeLabel.Text = $"Welcome, {message.User.Name}!";
        });
    }
    
    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        WeakReferenceMessenger.Default.UnregisterAll(this);
    }
}
```

**Key Differences:**
- ✅ Type-safe message classes
- ✅ No magic strings
- ✅ Better IntelliSense support
- ✅ Easier to refactor
- ⚠️ **Must remember to unregister!**

---

### ListView and TableView Deprecated

**Status:** 🚨 **DEPRECATED (P0)** - `ListView`, `TableView`, and all Cell types are now obsolete. Migrate to `CollectionView`.

**Warning You'll See:**
```
warning CS0618: 'ListView' is obsolete: 'ListView is deprecated. Please use CollectionView instead.'
warning CS0618: 'TableView' is obsolete: 'Please use CollectionView instead.'
warning CS0618: 'TextCell' is obsolete: 'The controls which use TextCell (ListView and TableView) are obsolete. Please use CollectionView instead.'
```

**Obsolete Types:**
- `ListView` → `CollectionView`
- `TableView` → `CollectionView` (for settings pages, consider vertical StackLayout with BindableLayout)
- `TextCell` → Custom DataTemplate with Label(s)
- `ImageCell` → Custom DataTemplate with Image + Label(s)
- `EntryCell` → Custom DataTemplate with Entry
- `SwitchCell` → Custom DataTemplate with Switch
- `ViewCell` → DataTemplate

**Impact:** This is a **MAJOR** breaking change. ListView and TableView are among the most commonly used controls in MAUI apps.

#### Why This Takes Time

Converting ListView/TableView to CollectionView is not a simple find-replace:

1. **Different event model** - `ItemSelected` → `SelectionChanged` with different arguments
2. **Different grouping** - GroupDisplayBinding no longer exists
3. **Context actions** - Must convert to SwipeView
4. **Item sizing** - `HasUnevenRows` handled differently
5. **Platform-specific code** - iOS/Android ListView platform configurations need removal
6. **Testing required** - CollectionView virtualizes differently, may affect performance

#### Migration Strategy

**Step 1: Inventory Your ListViews**

```bash
# Find all ListView/TableView usages
grep -r "ListView\|TableView" --include="*.xaml" --include="*.cs" .
```

**Step 2: Basic ListView → CollectionView**

**Before (ListView):**
```xaml
<ListView ItemsSource="{Binding Items}"
          ItemSelected="OnItemSelected"
          HasUnevenRows="True">
    <ListView.ItemTemplate>
        <DataTemplate>
            <TextCell Text="{Binding Title}"
                     Detail="{Binding Description}" />
        </DataTemplate>
    </ListView.ItemTemplate>
</ListView>
```

**After (CollectionView):**
```xaml
<CollectionView ItemsSource="{Binding Items}"
                SelectionMode="Single"
                SelectionChanged="OnSelectionChanged">
    <CollectionView.ItemTemplate>
        <DataTemplate>
            <VerticalStackLayout Padding="10">
                <Label Text="{Binding Title}" 
                       FontAttributes="Bold" />
                <Label Text="{Binding Description}"
                       FontSize="12"
                       TextColor="{StaticResource Gray600}" />
            </VerticalStackLayout>
        </DataTemplate>
    </CollectionView.ItemTemplate>
</CollectionView>
```

> ⚠️ **Note:** CollectionView has `SelectionMode="None"` by default (selection disabled). You must explicitly set `SelectionMode="Single"` or `SelectionMode="Multiple"` to enable selection.

**Code-behind changes:**
```csharp
// ❌ OLD (ListView)
void OnItemSelected(object sender, SelectedItemChangedEventArgs e)
{
    if (e.SelectedItem == null)
        return;
        
    var item = (MyItem)e.SelectedItem;
    // Handle selection
    
    // Deselect
    ((ListView)sender).SelectedItem = null;
}

// ✅ NEW (CollectionView)
void OnSelectionChanged(object sender, SelectionChangedEventArgs e)
{
    if (e.CurrentSelection.Count == 0)
        return;
        
    var item = (MyItem)e.CurrentSelection.FirstOrDefault();
    // Handle selection
    
    // Deselect (optional)
    ((CollectionView)sender).SelectedItem = null;
}
```

**Step 3: Grouped ListView → Grouped CollectionView**

**Before (Grouped ListView):**
```xaml
<ListView ItemsSource="{Binding GroupedItems}"
          IsGroupingEnabled="True"
          GroupDisplayBinding="{Binding Key}">
    <ListView.ItemTemplate>
        <DataTemplate>
            <TextCell Text="{Binding Name}" />
        </DataTemplate>
    </ListView.ItemTemplate>
</ListView>
```

**After (Grouped CollectionView):**
```xaml
<CollectionView ItemsSource="{Binding GroupedItems}"
                IsGrouped="true">
    <CollectionView.GroupHeaderTemplate>
        <DataTemplate>
            <Label Text="{Binding Key}"
                   FontAttributes="Bold"
                   BackgroundColor="{StaticResource Gray100}"
                   Padding="10,5" />
        </DataTemplate>
    </CollectionView.GroupHeaderTemplate>
    
    <CollectionView.ItemTemplate>
        <DataTemplate>
            <VerticalStackLayout Padding="20,10">
                <Label Text="{Binding Name}" />
            </VerticalStackLayout>
        </DataTemplate>
    </CollectionView.ItemTemplate>
</CollectionView>
```

**Step 4: Context Actions → SwipeView**

> ⚠️ **Platform Note:** SwipeView requires touch input. On Windows desktop, it only works with touch screens, not with mouse/trackpad. Consider providing alternative UI for desktop scenarios (e.g., buttons, right-click menu).

**Before (ListView with ContextActions):**
```xaml
<ListView.ItemTemplate>
    <DataTemplate>
        <ViewCell>
            <ViewCell.ContextActions>
                <MenuItem Text="Delete" 
                         IsDestructive="True"
                         Command="{Binding Source={RelativeSource AncestorType={x:Type local:MyPage}}, Path=DeleteCommand}"
                         CommandParameter="{Binding .}" />
            </ViewCell.ContextActions>
            
            <Label Text="{Binding Title}" Padding="10" />
        </ViewCell>
    </DataTemplate>
</ListView.ItemTemplate>
```

**After (CollectionView with SwipeView):**
```xaml
<CollectionView.ItemTemplate>
    <DataTemplate>
        <SwipeView>
            <SwipeView.RightItems>
                <SwipeItems>
                    <SwipeItem Text="Delete"
                              BackgroundColor="Red"
                              Command="{Binding Source={RelativeSource AncestorType={x:Type local:MyPage}}, Path=DeleteCommand}"
                              CommandParameter="{Binding .}" />
                </SwipeItems>
            </SwipeView.RightItems>
            
            <VerticalStackLayout Padding="10">
                <Label Text="{Binding Title}" />
            </VerticalStackLayout>
        </SwipeView>
    </DataTemplate>
</CollectionView.ItemTemplate>
```

**Step 5: TableView for Settings → Alternative Approaches**

TableView is commonly used for settings pages. Here are modern alternatives:

**Option 1: CollectionView with Grouped Data**
```xaml
<CollectionView ItemsSource="{Binding SettingGroups}"
                IsGrouped="true"
                SelectionMode="None">
    <CollectionView.GroupHeaderTemplate>
        <DataTemplate>
            <Label Text="{Binding Title}" 
                   FontAttributes="Bold"
                   Margin="10,15,10,5" />
        </DataTemplate>
    </CollectionView.GroupHeaderTemplate>
    
    <CollectionView.ItemTemplate>
        <DataTemplate>
            <Grid Padding="15,10" ColumnDefinitions="*,Auto">
                <Label Text="{Binding Title}" 
                       VerticalOptions="Center" />
                <Switch Grid.Column="1" 
                        IsToggled="{Binding IsEnabled}"
                        IsVisible="{Binding ShowSwitch}" />
            </Grid>
        </DataTemplate>
    </CollectionView.ItemTemplate>
</CollectionView>
```

**Option 2: Vertical StackLayout (for small settings lists)**
```xaml
<ScrollView>
    <VerticalStackLayout BindableLayout.ItemsSource="{Binding Settings}"
                        Spacing="10"
                        Padding="15">
        <BindableLayout.ItemTemplate>
            <DataTemplate>
                <Border StrokeThickness="0"
                       BackgroundColor="{StaticResource Gray100}"
                       Padding="15,10">
                    <Grid ColumnDefinitions="*,Auto">
                        <Label Text="{Binding Title}" 
                              VerticalOptions="Center" />
                        <Switch Grid.Column="1" 
                               IsToggled="{Binding IsEnabled}" />
                    </Grid>
                </Border>
            </DataTemplate>
        </BindableLayout.ItemTemplate>
    </VerticalStackLayout>
</ScrollView>
```

**Step 6: Remove Platform-Specific ListView Code**

If you used platform-specific ListView features, remove them:

```csharp
// ❌ OLD - Remove these using statements (NOW OBSOLETE IN .NET 10)
using Microsoft.Maui.Controls.PlatformConfiguration;
using Microsoft.Maui.Controls.PlatformConfiguration.iOSSpecific;
using Microsoft.Maui.Controls.PlatformConfiguration.AndroidSpecific;

// ❌ OLD - Remove ListView platform configurations (NOW OBSOLETE IN .NET 10)
myListView.On<iOS>().SetSeparatorStyle(SeparatorStyle.FullWidth);
myListView.On<Android>().IsFastScrollEnabled();

// ❌ OLD - Remove Cell platform configurations (NOW OBSOLETE IN .NET 10)
viewCell.On<iOS>().SetDefaultBackgroundColor(Colors.White);
viewCell.On<Android>().SetIsContextActionsLegacyModeEnabled(false);
```

**Migration:** CollectionView does not have platform-specific configurations in the same way. If you need platform-specific styling:

```csharp
// ✅ NEW - Use conditional compilation
#if IOS
var backgroundColor = Colors.White;
#elif ANDROID
var backgroundColor = Colors.Transparent;
#endif

var grid = new Grid
{
    BackgroundColor = backgroundColor,
    // ... rest of cell content
```

---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/dotnet-maui-9-to-dotnet-maui-10-upgrade-full.md](../docs/rule-references/dotnet-maui-9-to-dotnet-maui-10-upgrade-full.md). Read that file on demand when deeper details are needed.
