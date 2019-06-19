const CONTAINER = '.js-log';

class SongLog {
    constructor($container) {
        this.$container = $container;
        this.pollingUrl = $container.data('polling-url');
        this.channelId = $container.data('channel-id');
        this.callback = `songLogPollerCallback_${$container.data('teaser-id')}`;

        this.urlParams =  new URLSearchParams();
        this.urlParams.append('fromDate', $container.data('date-from'));
        this.urlParams.append('toDate', $container.data('date-to'));
        this.urlParams.append('page.size', $container.data('page-size'));
        this.urlParams.append('page.sort', 'playedDate');

        this.fetchLogData()
            .then(data => {
                $(data.Songlog).each((key, value) => {
                    $(this.$container).prepend(`
                      <li class="log__entry">
                        <div class="log__time">${value.playedDate.substring(11, 16)}</div>
                        <div class="log__title">${value.Song.title}</div>
                        <div class="log__artist">${value.Song.Artist.name}</div>
                      </li>
                    `);
                });
            });
    }

    fetchLogData() {
        return $.ajax(`${this.pollingUrl}/${this.channelId}.json?${this.urlParams}`, {
            type: "GET",
            cache: "true",
            jsonpCallback: this.callback,
            dataType: "jsonp"
        });
    }
}

export function init() {
    let $container = $(CONTAINER);
    if ($container) {
        new SongLog($container);
    }
}
