<?php

namespace SRF\Twig;


use PatternLab\Config;
use PatternLab\Data;
use PatternLab\Listener;
use PatternLab\PatternEngine\Twig\TwigUtil;
use Twig\Markdown\MarkdownExtension;
use Twig\Markdown\DefaultMarkdown;
use Twig\Markdown\MarkdownRuntime;
use Twig\RuntimeLoader\RuntimeLoaderInterface;


class PatternLabListener extends Listener {

    /**
     * Add the listeners for this plug-in
     */
    public function __construct() {

        $this->addListener("twigLoader.customize","addExtensions");

    }

    /**
     * Add the extensions to the appropriate instance
     */
    public function addExtensions() {

        // If not set in config, this will return false
        $assetsPrefix = Config::getOption('assetsDir');
        if (!$assetsPrefix) {
            // Default value
            $assetsPrefix = Config::getOption('assetsDirDefault');
        }

        $instance = TwigUtil::getInstance();
        $instance->addGlobal('frameworkAssetPath', $assetsPrefix);

        // enable the markdown filter
        $instance->addExtension(new MarkdownExtension());
        $instance->addRuntimeLoader(new class implements RuntimeLoaderInterface {
            public function load($class) {
                if (MarkdownRuntime::class === $class) {
                    return new MarkdownRuntime(new DefaultMarkdown());
                }
            }
        });
    }

}
