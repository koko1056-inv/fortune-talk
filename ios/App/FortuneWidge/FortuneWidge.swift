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
            ZStack {
                // 背景画像（暗めのオーバーレイ付き）
                GeometryReader { geo in
                    Image("FortuneTeller")
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geo.size.width + 20, height: geo.size.height + 20) // 少し大きめにして隙間を防ぐ
                        .clipped()
                        .overlay(Color.black.opacity(0.4)) // 暗くして文字を見やすく
                }
                
                // コンテンツ
                VStack(spacing: 6) {
                    Spacer()
                    
                    Text("今日の運勢を")
                        .font(.system(size: 15, weight: .heavy))
                        .foregroundColor(.white)
                        .shadow(color: .black, radius: 4, x: 0, y: 2)
                    
                    Text("占いましょう")
                        .font(.system(size: 15, weight: .heavy))
                        .foregroundColor(.white)
                        .shadow(color: .black, radius: 4, x: 0, y: 2)
                    
                    Spacer().frame(height: 8)
                    
                    // ボタン風のデザイン
                    Text("🔮 今すぐ占う")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.vertical, 6)
                        .padding(.horizontal, 12)
                        .background(
                            Capsule()
                                .fill(Color.purple.opacity(0.8))
                                .overlay(
                                    Capsule().stroke(Color.white.opacity(0.5), lineWidth: 1)
                                )
                        )
                        .shadow(radius: 4)
                        
                    Spacer().frame(height: 12)
                }
            }
            .widgetBackground(Color.black)
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
                    Text("タップして確認")
                        .font(.caption)
                        .opacity(0.8)
                }
            }
            .widgetBackground(Color.clear)
            
        case .accessoryInline:
            Text("✨ 今日の運勢")
            
        default:
            ZStack {
                // 1. 背景：画像を拡大してぼかして配置（隙間を埋めるため）
                GeometryReader { geo in
                    Image("DailyCard")
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geo.size.width, height: geo.size.height)
                        .blur(radius: 15) // 大きくぼかす
                        .overlay(Color.black.opacity(0.5)) // 暗くしてメインを引き立てる
                }
                
                // 2. メイン：カード全体を表示（見切れないようにFitさせる）
                Image("DailyCard")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.all, 12) // 端に余白を持たせる
                    .padding(.bottom, 20) // ボタンと被らないように少し上に
                    .shadow(color: .black.opacity(0.5), radius: 8, x: 0, y: 4) // 浮き出ているような影
                
                // 3. コンテンツ（ボタン）
                VStack {
                    Spacer()
                    
                    // ボタン風のデザイン
                    Text("運勢を見る")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color.black.opacity(0.8))
                        .padding(.vertical, 5)
                        .padding(.horizontal, 14)
                        .background(
                            Capsule()
                                .fill(Color(hue: 0.12, saturation: 0.2, brightness: 0.95))
                                .shadow(radius: 4)
                        )
                        .padding(.bottom, 10)
                }
            }
            .widgetBackground(Color.black)
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
struct FortuneWidgeBundle: WidgetBundle {
    var body: some Widget {
        StartFortuneWidget()
        DailyFortuneWidget()
    }
}
