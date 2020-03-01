const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
    const pluginName = core.getInput('plugin-name');

    await core.exportVariable('RAILS_ENV', 'test');
    await core.exportVariable('DATABASE_URL', 'postgresql://postgres:@localhost/test');
    await core.exportVariable('DATABASE_CLEANER_ALLOW_REMOTE_DATABASE_URL', 'true');

    await exec.exec('sudo apt-get install build-essential libcurl4-openssl-dev libvirt-dev ruby-libvirt zlib1g-dev libpq-dev');
    await exec.exec('gem install bundler');
    await exec.exec('bundle config set without journald development console mysql2 sqlite');

    const gemfile = `gem '${pluginName}', path: './${pluginName}'`
    await exec.exec(`ex -sc "a|${gemfile}" -cx bundler.d/${pluginName}'.local.rb`);

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
