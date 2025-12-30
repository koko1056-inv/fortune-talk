import WidgetKit
import SwiftUI

// MARK: - Widget Entry
struct FortuneEntry: TimelineEntry {
    let date: Date
    let widgetType: WidgetType
}

enum WidgetType: String {
    case startFortune = "start_fortune"
    case dailyFortune = "daily_fortune"
}

// MARK: - Widget Provider
struct FortuneProvider: TimelineProvider {
    func placeholder(in context: Context) -> FortuneEntry {
        FortuneEntry(date: Date(), widgetType: .startFortune)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (FortuneEntry) -> Void) {
        let entry = FortuneEntry(date: Date(), widgetType: .startFortune)
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<FortuneEntry>) -> Void) {
        let currentDate = Date()
        let entry = FortuneEntry(date: currentDate, widgetType: .startFortune)
        
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        completion(timeline)
    }
}

// MARK: - View Extension for Container Background
extension View {
    @ViewBuilder
    func widgetBackground(_ background: some View) -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(for: .widget) {
                background
            }
        } else {
            self.background(background)
        }
    }
}

// MARK: - Widget Views
struct StartFortuneWidgetView: View {
    var entry: FortuneEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .accessoryCircular:
            ZStack {
                Circle().fill(.white.opacity(0.2))
                Text("🔮").font(.system(size: 24))
            }
            .widgetBackground(Color.clear)
            
        case .accessoryRectangular:
            HStack {
                Text("🔮").font(.title)
                Text("占い開始")
                    .font(.headline)
                    .bold()
            }
            .widgetBackground(Color.clear)
            
        case .accessoryInline:
            Text("🔮 占い開始")
            
        default:
            // Home Screen (Small)
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color(hue: 0.78, saturation: 0.70, brightness: 0.50).opacity(0.3))
                        .frame(width: 50, height: 50)
                        .blur(radius: 10)
                    
                    Text("🔮")
                        .font(.system(size: 32))
                }
                
                Text("占い開始")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundColor(Color(hue: 0.125, saturation: 0.80, brightness: 0.95))
                
                Text("✧ タップして占う ✧")
                    .font(.system(size: 10, weight: .regular))
                    .foregroundColor(Color(hue: 0.125, saturation: 0.80, brightness: 0.55))
            }
            .widgetBackground(
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(hue: 0.72, saturation: 0.30, brightness: 0.08),
                        Color(hue: 0.78, saturation: 0.70, brightness: 0.50).opacity(0.3)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        }
    }
}

struct DailyFortuneWidgetView: View {
    var entry: FortuneEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .accessoryCircular:
            ZStack {
                Circle().fill(.white.opacity(0.2))
                Text("✨").font(.system(size: 24))
            }
            .widgetBackground(Color.clear)
            
        case .accessoryRectangular:
            HStack {
                Text("✨").font(.title)
                VStack(alignment: .leading) {
                    Text("今日の運勢")
                        .font(.headline)
                        .bold()
                    HStack(spacing: 1) {
                        ForEach(0..<5) { _ in
                            Image(systemName: "star.fill")
                                .font(.caption2)
                        }
                    }
                }
            }
            .widgetBackground(Color.clear)
            
        case .accessoryInline:
            Text("✨ 今日の運勢")
            
        default:
            // Home Screen (Small)
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color(hue: 0.125, saturation: 0.80, brightness: 0.55).opacity(0.3))
                        .frame(width: 50, height: 50)
                        .blur(radius: 10)
                    
                    Text("✨")
                        .font(.system(size: 32))
                }
                
                Text("今日の運勢")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundColor(Color(hue: 0.125, saturation: 0.80, brightness: 0.95))
                
                HStack(spacing: 4) {
                    ForEach(0..<5) { _ in
                        Image(systemName: "star.fill")
                            .font(.system(size: 10))
                            .foregroundColor(Color(hue: 0.125, saturation: 0.80, brightness: 0.55))
                    }
                }
                
                Text("タップして確認")
                    .font(.system(size: 10, weight: .regular))
                    .foregroundColor(Color(hue: 0.125, saturation: 0.80, brightness: 0.55).opacity(0.8))
            }
            .widgetBackground(
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(hue: 0.72, saturation: 0.30, brightness: 0.08),
                        Color(hue: 0.125, saturation: 0.80, brightness: 0.55).opacity(0.2)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        }
    }
}

// MARK: - Widget Configuration
struct StartFortuneWidget: Widget {
    let kind: String = "StartFortuneWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FortuneProvider()) { entry in
            StartFortuneWidgetView(entry: entry)
                .widgetURL(URL(string: "fortunetalk://start-fortune"))
        }
        .configurationDisplayName("占い開始")
        .description("タップして占いを開始します")
        .supportedFamilies([.systemSmall, .accessoryCircular, .accessoryRectangular, .accessoryInline])
        .contentMarginsDisabled()
    }
}

struct DailyFortuneWidget: Widget {
    let kind: String = "DailyFortuneWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FortuneProvider()) { entry in
            DailyFortuneWidgetView(entry: entry)
                .widgetURL(URL(string: "fortunetalk://daily-fortune"))
        }
        .configurationDisplayName("今日の運勢")
        .description("今日の運勢を確認します")
        .supportedFamilies([.systemSmall, .accessoryCircular, .accessoryRectangular, .accessoryInline])
        .contentMarginsDisabled()
    }
}

// MARK: - Widget Bundle
@main
struct FortuneWidgetBundle: WidgetBundle {
    var body: some Widget {
        StartFortuneWidget()
        DailyFortuneWidget()
    }
}
