#!./chorus_installation/bin/ruby

require_relative 'chorus_installation/packaging/install/version_detector'
require_relative 'chorus_installation/packaging/install/chorus_logger'
require_relative 'chorus_installation/packaging/install/installer_io'
require_relative 'chorus_installation/packaging/install/chorus_installer'

if __FILE__ == $0
  begin
    installer = ChorusInstaller.new({
        installer_home: File.dirname(__FILE__),
        silent: ARGV.include?('-a'),
        version_detector: VersionDetector.new,
        logger: ChorusLogger.new,
        io: InstallerIO.new(ARGV.include?('-a'))
    })

    installer.install
    installer.startup

    puts "Installation completed."
    unless installer.upgrade_existing?
      puts "To start Chorus, run the following commands:"
      puts "source #{installer.destination_path}/chorus_path.sh"
      puts "chorus_control.sh start"
    end
  rescue InstallerErrors::InstallationFailed => e
    puts "An error has occurred. Trying to back out and restore previous state.."
    installer.remove_and_restart_previous!
    exit 1
  rescue => e
    File.open("install.log", "a") { |f| f.puts "#{e.class}: #{e.message}" }
    puts "Failed to start chorus back up"
    exit 1
  end
end