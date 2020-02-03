const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
    const pluginName = core.getInput('plugin-name');

    await exec.exec('sudo apt-get install build-essential libcurl4-openssl-dev libvirt-dev ruby-libvirt zlib1g-dev libpq-dev');
    await exec.exec('gem install bundler');
    await exec.exec(`echo "gemspec :path => '${pluginName}'" > bundler.d/${pluginName}.local.rb`);
    await exec.exec('bundle config set without journald development console journald mysql2 sqlite');
    await exec.exec('bundle install --jobs=3 --retry=3');
    await exec.exec('npm install');
    await exec.exec('bundle exec rake db:create');
    await exec.exec('bundle exec rake db:migrate');
    await exec.exec('bundle exec rake webpack:compile');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();